import { ProductSpecification, AIExtractionResult } from '@/types';
import { searchWeb, isOfficialSource } from '@/services/web-search';

// Lazy-load Anthropic SDK to avoid "self is not defined" in Next.js edge runtime
let _anthropic: any = null;
function getAnthropicClient() {
  if (!_anthropic) {
    if (!process.env.ANTHROPIC_API_KEY) throw new Error('ANTHROPIC_API_KEY environment variable is not set');
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const Anthropic = require('@anthropic-ai/sdk').default;
    _anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });
  }
  return _anthropic;
}

export interface ExtractionRequest {
  content: string;
  sourceUrl?: string;
  pageNumber?: number;
  productName?: string;
  manufacturer?: string;
}

export interface SpecificationTemplate {
  category: string;
  name: string;
  unit?: string;
  dataType: 'number' | 'string' | 'boolean' | 'range';
  required: boolean;
  description: string;
  aliases?: string[];
}

const SPECIFICATION_TEMPLATES: SpecificationTemplate[] = [
  // ── Electrical Specifications ──
  { category: 'Electrical', name: 'Maximum AC Output Power', unit: 'W', dataType: 'number', required: true, description: 'Maximum continuous AC output power (also called "rated power" or "nominal power")', aliases: ['Maximum Power', 'Rated Output Power', 'Nominal AC Power', 'Max Output Power', 'AC Power Rating'] },
  { category: 'Electrical', name: 'Maximum DC Input Power', unit: 'W', dataType: 'number', required: true, description: 'Maximum DC input power per MPPT or total. Also called "Max Module Size" or "Recommended Max PV Module Power"', aliases: ['Max DC Power', 'Max Module Size', 'Recommended Max PV Power', 'Max PV Input Power', 'Peak DC Input'] },
  { category: 'Electrical', name: 'Nominal Grid Voltage', unit: 'V', dataType: 'range', required: true, description: 'Nominal AC grid voltage, e.g. "240" or "208-240"', aliases: ['AC Voltage', 'Grid Voltage', 'Output Voltage', 'Rated AC Voltage'] },
  { category: 'Electrical', name: 'MPPT Voltage Range', unit: 'V', dataType: 'range', required: true, description: 'MPPT operating voltage range, e.g. "16-58" or "22-55"', aliases: ['MPP Voltage Range', 'Operating MPPT Voltage Range', 'Maximum Power Point Voltage Range', 'Peak Power Tracking Voltage Range', 'Peak Power Tracking Range', 'Maximum Power Point Tracking (MPPT) Voltage Range'] },
  { category: 'Electrical', name: 'Input Voltage Range', unit: 'V', dataType: 'range', required: true, description: 'Full DC input voltage range (wider than MPPT range), e.g. "16-62"', aliases: ['DC Input Voltage Range', 'DC Voltage Range', 'Operating Input Voltage'] },
  { category: 'Electrical', name: 'Start-up Voltage', unit: 'V', dataType: 'number', required: false, description: 'Minimum DC voltage to begin power conversion', aliases: ['Start Voltage', 'Turn-on Voltage', 'Startup Voltage', 'Minimum Start Voltage'] },
  { category: 'Electrical', name: 'Maximum Input Voltage (Voc)', unit: 'V', dataType: 'number', required: true, description: 'Maximum open-circuit voltage (Voc) from PV module. Absolute maximum DC input', aliases: ['Max Voc', 'Max DC Voltage', 'Maximum DC Input Voltage', 'Absolute Max Input Voltage'] },
  { category: 'Electrical', name: 'Maximum Short Circuit Current (Isc)', unit: 'A', dataType: 'number', required: true, description: 'Maximum short-circuit current per input', aliases: ['Max Isc', 'Max Short Circuit Current', 'Max DC Short Circuit Current', 'Maximum Input Short Circuit Current'] },
  { category: 'Electrical', name: 'Maximum Input Current', unit: 'A', dataType: 'number', required: true, description: 'Maximum operating input current per MPPT', aliases: ['Max DC Input Current', 'Max Operating Input Current', 'Rated Input Current'] },
  { category: 'Electrical', name: 'Maximum Output Current', unit: 'A', dataType: 'number', required: false, description: 'Maximum continuous AC output current', aliases: ['Max AC Output Current', 'Rated Output Current', 'Max AC Current'] },
  { category: 'Electrical', name: 'Frequency', unit: 'Hz', dataType: 'range', required: false, description: 'AC frequency, e.g. "60" or "50/60"', aliases: ['AC Frequency', 'Grid Frequency', 'Rated Frequency'] },
  { category: 'Electrical', name: 'Power Factor', unit: '', dataType: 'number', required: false, description: 'Power factor, e.g. ">0.99" or "1.0 adjustable"', aliases: ['PF', 'Displacement Power Factor'] },
  { category: 'Electrical', name: 'THD', unit: '%', dataType: 'number', required: false, description: 'Total harmonic distortion of AC output current, e.g. "<3%" or "<5%"', aliases: ['Total Harmonic Distortion', 'THDi', 'Current THD'] },
  { category: 'Electrical', name: 'Night Consumption', unit: 'W', dataType: 'number', required: false, description: 'Standby/night power consumption, e.g. "50 mW" or "0.05 W"', aliases: ['Standby Power', 'Night Power Consumption', 'Standby Consumption', 'Night Tare Loss'] },
  { category: 'Electrical', name: 'Number of MPPTs', unit: '', dataType: 'number', required: true, description: 'Number of independent MPPT trackers (1, 2, 3, or 4)', aliases: ['No. of MPPTs', 'MPPT Channels', 'MPPT Trackers', 'Number of MPPT Inputs'] },

  // ── Efficiency & Performance ──
  { category: 'Performance', name: 'Peak Efficiency', unit: '%', dataType: 'number', required: true, description: 'Maximum/peak conversion efficiency, e.g. "97.5%"', aliases: ['Max Efficiency', 'Maximum Efficiency', 'Inverter Max Efficiency'] },
  { category: 'Performance', name: 'CEC Weighted Efficiency', unit: '%', dataType: 'number', required: false, description: 'CEC weighted efficiency (California Energy Commission). Used in North America', aliases: ['CEC Efficiency', 'Weighted Efficiency (CEC)', 'CEC Rating'] },
  { category: 'Performance', name: 'European Weighted Efficiency', unit: '%', dataType: 'number', required: false, description: 'European weighted efficiency (EN 50530). Used in EU markets', aliases: ['Euro Efficiency', 'EU Efficiency', 'European Efficiency', 'Weighted Efficiency (EU)'] },

  // ── Mechanical / Physical ──
  { category: 'Mechanical', name: 'Weight', unit: 'kg', dataType: 'number', required: true, description: 'Product weight in kg (convert from lbs if needed: 1 lb = 0.4536 kg)', aliases: ['Unit Weight', 'Net Weight', 'Mass'] },
  { category: 'Mechanical', name: 'Dimensions', unit: 'mm', dataType: 'string', required: true, description: 'Physical dimensions as "L × W × H" in mm, e.g. "212 × 175 × 30.2"', aliases: ['Size', 'Unit Dimensions', 'Enclosure Dimensions'] },
  { category: 'Mechanical', name: 'Operating Temperature Range', unit: '°C', dataType: 'range', required: true, description: 'Ambient operating temperature range, e.g. "-40 to +65"', aliases: ['Operating Temperature', 'Ambient Temperature Range', 'Operating Temp'] },
  { category: 'Mechanical', name: 'IP Rating', unit: '', dataType: 'string', required: true, description: 'Ingress protection rating, e.g. "IP67" or "NEMA 6"', aliases: ['Protection Rating', 'Enclosure Rating', 'Environmental Rating', 'NEMA Rating'] },

  // ── Connectivity ──
  { category: 'Connectivity', name: 'Communication Type', unit: '', dataType: 'string', required: true, description: 'Communication protocol: "PLC" (power line), "WiFi", "Zigbee", "Sub-1G", "RS-485"', aliases: ['Communication', 'Communication Protocol', 'Data Communication', 'Comm Interface'] },
  { category: 'Connectivity', name: 'Monitoring Platform', unit: '', dataType: 'string', required: false, description: 'Cloud monitoring platform name, e.g. "Enphase Enlighten", "APsystems EMA", "S-Miles"', aliases: ['Monitoring System', 'Cloud Platform', 'Monitoring Software'] },

  // ── Warranty & Certification ──
  { category: 'Warranty', name: 'Standard Warranty', unit: 'years', dataType: 'number', required: true, description: 'Standard warranty period in years, e.g. "25"', aliases: ['Warranty', 'Warranty Period', 'Product Warranty', 'Limited Warranty'] },
  { category: 'Warranty', name: 'Extended Warranty', unit: 'years', dataType: 'number', required: false, description: 'Extended/optional warranty period in years', aliases: ['Extended Warranty Option'] },

  // ── Safety & Compliance ──
  { category: 'Safety', name: 'Certifications', unit: '', dataType: 'string', required: false, description: 'Safety and grid certifications, e.g. "UL 1741, IEEE 1547, IEC 62109, FCC Part 15"', aliases: ['Safety Certifications', 'Standards', 'Compliance', 'Approvals'] },
  { category: 'Safety', name: 'Surge Protection', unit: 'kA', dataType: 'number', required: false, description: 'DC and/or AC surge protection rating in kA, e.g. "6 kA"', aliases: ['Surge Rating', 'SPD Rating'] },
  { category: 'Safety', name: 'Rapid Shutdown', unit: '', dataType: 'boolean', required: false, description: 'Whether product supports NEC 2017/2020 rapid shutdown compliance', aliases: ['NEC 2017 Compliant', 'Module-Level Shutdown'] },

  // ── System / Grid ──
  { category: 'System', name: 'Max System Voltage', unit: 'V', dataType: 'number', required: false, description: 'Maximum PV system voltage (typically 600V or 1000V)', aliases: ['System Voltage', 'Max PV System Voltage'] },
  { category: 'System', name: 'Number of DC Inputs', unit: '', dataType: 'number', required: false, description: 'Number of DC input pairs/connectors (may differ from MPPT count)', aliases: ['DC Inputs', 'Input Channels', 'PV Inputs'] },
  { category: 'System', name: 'Connector Type', unit: '', dataType: 'string', required: false, description: 'DC connector type, e.g. "MC4", "QT2" or "Enphase Q Cable"', aliases: ['DC Connector', 'PV Connector', 'Input Connector'] },

  // ── Product Identity ──
  { category: 'Identity', name: 'Model Number', unit: '', dataType: 'string', required: true, description: 'Full product model/SKU number, e.g. "IQ8P-72-2-US"', aliases: ['Model', 'SKU', 'Part Number', 'Order Number'] },
  { category: 'Identity', name: 'Product Series', unit: '', dataType: 'string', required: false, description: 'Product series/family name, e.g. "IQ8", "HMS", "DS3"', aliases: ['Series', 'Product Family', 'Product Line'] },

  // ── Market Data ──
  { category: 'Market', name: 'Launch Date', unit: '', dataType: 'string', required: false, description: 'Product launch/availability date, e.g. "2023 Q3" or "March 2024"', aliases: ['Release Date', 'Availability Date', 'Date Available'] },
  { category: 'Market', name: 'Power Class', unit: '', dataType: 'string', required: false, description: 'Product tier/class, e.g. "Residential", "Commercial", "Utility"', aliases: ['Application', 'Market Segment', 'Product Class'] },
];

export class AIExtractionService {
  /**
   * Extract product specifications from raw text content using Claude 3.5 Sonnet
   */
  async extractSpecifications(request: ExtractionRequest): Promise<AIExtractionResult> {
    try {
      const systemPrompt = this.buildSystemPrompt();
      const userPrompt = this.buildUserPrompt(request);

      const completion = await getAnthropicClient().messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 4096,
        temperature: 0.1,
        system: systemPrompt,
        messages: [
          { role: 'user', content: userPrompt }
        ],
      });

      const response = completion.content[0]?.type === 'text' ? completion.content[0].text : null;
      if (!response) {
        throw new Error('No response from Claude');
      }

      // Parse the JSON response
      const extractedData = this.parseAIResponse(response);
      
      // Calculate confidence scores
      const specifications = this.calculateConfidenceScores(extractedData.specifications, request);

      return {
        specifications,
        confidence: this.calculateOverallConfidence(specifications),
        sourceUrl: request.sourceUrl || '',
        extractedAt: new Date(),
      };
    } catch (error) {
      console.error('AI extraction error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to extract specifications: ${errorMessage}`);
    }
  }

  /**
   * Generate AI summary for a product
   */
  async generateProductSummary(productData: {
    name: string;
    manufacturer: string;
    specifications: ProductSpecification[];
  }): Promise<string> {
    try {
      const specsText = productData.specifications
        .map(spec => `${spec.name}: ${spec.value} ${spec.unit || ''}`)
        .join(', ');

      const prompt = `
        Generate a concise, professional summary for this microinverter product:
        
        Product: ${productData.name}
        Manufacturer: ${productData.manufacturer}
        Key Specifications: ${specsText}
        
        The summary should:
        - Be 2-3 sentences long
        - Highlight key features and benefits
        - Use professional, technical language
        - Focus on what makes this product notable
        - Be factual and based only on the specifications provided
      `;

      const completion = await getAnthropicClient().messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 300,
        temperature: 0.3,
        system: 'You are an expert in solar energy products. Generate professional, factual product summaries.',
        messages: [
          { role: 'user', content: prompt }
        ],
      });

      return completion.content[0]?.type === 'text' ? completion.content[0].text.trim() : '';
    } catch (error) {
      console.error('Summary generation error:', error);
      return '';
    }
  }

  /**
   * Detect changes between old and new specifications
   */
  async detectChanges(
    oldSpecs: ProductSpecification[],
    newSpecs: ProductSpecification[]
  ): Promise<{
    added: ProductSpecification[];
    removed: ProductSpecification[];
    modified: { old: ProductSpecification; new: ProductSpecification }[];
  }> {
    const oldSpecMap = new Map(
      oldSpecs.map(spec => [`${spec.category}-${spec.name}`, spec])
    );
    const newSpecMap = new Map(
      newSpecs.map(spec => [`${spec.category}-${spec.name}`, spec])
    );

    const added: ProductSpecification[] = [];
    const removed: ProductSpecification[] = [];
    const modified: { old: ProductSpecification; new: ProductSpecification }[] = [];

    // Find added specifications
    for (const [key, newSpec] of newSpecMap) {
      if (!oldSpecMap.has(key)) {
        added.push(newSpec);
      }
    }

    // Find removed specifications
    for (const [key, oldSpec] of oldSpecMap) {
      if (!newSpecMap.has(key)) {
        removed.push(oldSpec);
      }
    }

    // Find modified specifications
    for (const [key, newSpec] of newSpecMap) {
      const oldSpec = oldSpecMap.get(key);
      if (oldSpec && oldSpec.value !== newSpec.value) {
        modified.push({ old: oldSpec, new: newSpec });
      }
    }

    return { added, removed, modified };
  }

  private buildSystemPrompt(): string {
    const templatesText = SPECIFICATION_TEMPLATES
      .map(template => {
        let line = `- "${template.name}" (${template.category}): ${template.description}`;
        if (template.unit) line += ` — Unit: ${template.unit}`;
        if (template.aliases && template.aliases.length > 0) {
          line += ` — Also labeled as: ${template.aliases.map(a => `"${a}"`).join(', ')}`;
        }
        return line;
      })
      .join('\n');

    return `You are an expert technical data extractor specializing in solar microinverter and power optimizer datasheets. Your task is to extract structured product specifications from technical documents with high accuracy.

SPECIFICATION FIELDS TO EXTRACT:
${templatesText}

EXTRACTION RULES:
1. Extract EVERY field you can find in the document. Be thorough — scan the entire text for each field.
2. Use the EXACT specification names from the list above (not the aliases). Aliases help you recognize values in the document.
3. For numeric values, extract the raw number WITHOUT the unit (e.g., value "366", unit "W" — NOT value "366W").
4. For ranges, use "min-max" format (e.g., "16-60", "-40-65"). Use a single hyphen as separator.
5. Convert units to match the template: weight to kg (1 lb = 0.4536 kg), dimensions to mm (1 inch = 25.4 mm).
6. For efficiency values (%), include one decimal place, e.g. "97.5" not "97.50" or "97".
7. CRITICAL: The "sourceText" field MUST be a verbatim quote from the document. Copy the exact text where you found the value.
8. NEVER invent, guess, or hallucinate values. If a specification is not explicitly stated in the document text, omit it entirely.
9. If the same spec appears multiple times for different regions/models, extract the primary or first occurrence.
10. Confidence scoring: 0.95+ for values clearly stated in a table; 0.80-0.94 for values in paragraph text; 0.60-0.79 for values requiring interpretation.

RESPONSE FORMAT (strict JSON, no markdown):
{
  "specifications": [
    {
      "category": "Electrical",
      "name": "Maximum AC Output Power",
      "value": "366",
      "unit": "W",
      "confidence": 0.97,
      "sourceText": "Rated Output Power: 366 W"
    }
  ]
}

FEW-SHOT EXAMPLES:

Example 1 — Microinverter datasheet text:
"IQ8P Microinverter | Rated AC Output Power: 366 VA | MPPT Voltage Range: 27-54 VDC | Max Input Voltage: 62 VDC | Max Input Current: 15 A | Max Short Circuit Current: 20 A | Peak Efficiency: 97.5% | CEC Efficiency: 97.0% | Weight: 1.08 kg | Dimensions: 212 × 175 × 30.2 mm | IP67 | Operating Temp: -40°C to +65°C | PLC Communication | 25 Year Warranty"

Expected extraction:
{
  "specifications": [
    { "category": "Electrical", "name": "Maximum AC Output Power", "value": "366", "unit": "W", "confidence": 0.97, "sourceText": "Rated AC Output Power: 366 VA" },
    { "category": "Electrical", "name": "MPPT Voltage Range", "value": "27-54", "unit": "V", "confidence": 0.97, "sourceText": "MPPT Voltage Range: 27-54 VDC" },
    { "category": "Electrical", "name": "Maximum Input Voltage (Voc)", "value": "62", "unit": "V", "confidence": 0.97, "sourceText": "Max Input Voltage: 62 VDC" },
    { "category": "Electrical", "name": "Maximum Input Current", "value": "15", "unit": "A", "confidence": 0.97, "sourceText": "Max Input Current: 15 A" },
    { "category": "Electrical", "name": "Maximum Short Circuit Current (Isc)", "value": "20", "unit": "A", "confidence": 0.97, "sourceText": "Max Short Circuit Current: 20 A" },
    { "category": "Performance", "name": "Peak Efficiency", "value": "97.5", "unit": "%", "confidence": 0.97, "sourceText": "Peak Efficiency: 97.5%" },
    { "category": "Performance", "name": "CEC Weighted Efficiency", "value": "97.0", "unit": "%", "confidence": 0.97, "sourceText": "CEC Efficiency: 97.0%" },
    { "category": "Mechanical", "name": "Weight", "value": "1.08", "unit": "kg", "confidence": 0.97, "sourceText": "Weight: 1.08 kg" },
    { "category": "Mechanical", "name": "Dimensions", "value": "212 × 175 × 30.2", "unit": "mm", "confidence": 0.97, "sourceText": "Dimensions: 212 × 175 × 30.2 mm" },
    { "category": "Mechanical", "name": "IP Rating", "value": "IP67", "unit": "", "confidence": 0.97, "sourceText": "IP67" },
    { "category": "Mechanical", "name": "Operating Temperature Range", "value": "-40-65", "unit": "°C", "confidence": 0.97, "sourceText": "Operating Temp: -40°C to +65°C" },
    { "category": "Connectivity", "name": "Communication Type", "value": "PLC", "unit": "", "confidence": 0.97, "sourceText": "PLC Communication" },
    { "category": "Warranty", "name": "Standard Warranty", "value": "25", "unit": "years", "confidence": 0.97, "sourceText": "25 Year Warranty" }
  ]
}

Example 2 — Two-column table text from a pdf-parse output (note: columns may be separated by whitespace):
"Input Data (DC)\\nMPPT Voltage Range   16 – 60 VDC\\nMax. Input Voltage   60 VDC\\nMax. Short Circuit Current per Input   20 A\\nMax. Input Current per MPPT   12.5 A\\nNumber of MPPT   2\\nOutput Data (AC)\\nRated Output Power   600 W\\nMax. Output Current   2.5 A"

Expected: extract "MPPT Voltage Range" = "16-60", "Maximum Input Voltage (Voc)" = "60", "Maximum Short Circuit Current (Isc)" = "20", "Maximum Input Current" = "12.5", "Number of MPPTs" = "2", "Maximum AC Output Power" = "600", "Maximum Output Current" = "2.5".`;
  }

  private buildUserPrompt(request: ExtractionRequest): string {
    let prompt = `Extract ALL product specifications from the following technical document.\n\n`;

    // Inject product context for disambiguation
    if (request.productName || request.manufacturer) {
      prompt += `=== PRODUCT CONTEXT ===\n`;
      if (request.manufacturer) prompt += `Manufacturer: ${request.manufacturer}\n`;
      if (request.productName) prompt += `Product: ${request.productName}\n`;

      // Detect product type to help AI disambiguate
      const combined = `${request.productName || ''} ${request.manufacturer || ''}`.toLowerCase();
      if (combined.includes('optimizer') || combined.includes('p505') || combined.includes('s440') || combined.includes('s500') || combined.includes('s650') || combined.includes('u650') || combined.includes('c651')) {
        prompt += `Product Type: Power Optimizer (DC-DC converter, NOT a grid-tied inverter)\n`;
      } else {
        prompt += `Product Type: Microinverter (DC-AC grid-tied inverter)\n`;
      }
      prompt += `\n`;
    }

    if (request.sourceUrl) {
      prompt += `Source URL: ${request.sourceUrl}\n`;
    }

    if (request.pageNumber) {
      prompt += `Page: ${request.pageNumber}\n`;
    }

    prompt += `\n=== DOCUMENT TEXT ===\n${request.content}\n\n`;
    prompt += `Instructions: Extract every specification you can find. Use exact "name" values from the specification list. Include the verbatim "sourceText" for each value. Return ONLY valid JSON.`;

    return prompt;
  }

  private parseAIResponse(response: string): any {
    try {
      // Try to parse as JSON directly
      return JSON.parse(response);
    } catch (error) {
      // If direct parsing fails, try to extract JSON from the response
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      throw new Error('Could not parse AI response as JSON');
    }
  }

  private calculateConfidenceScores(
    specifications: any[],
    request: ExtractionRequest
  ): ProductSpecification[] {
    return specifications.map(spec => ({
      ...spec,
      id: '', // Will be generated by database
      productId: '', // Will be set by caller
      extractedAt: new Date(),
      sourceUrl: request.sourceUrl,
      pageNumber: request.pageNumber,
      verifiedAt: null,
      isVerified: false,
    }));
  }

  private calculateOverallConfidence(specifications: ProductSpecification[]): number {
    if (specifications.length === 0) return 0;
    
    const totalConfidence = specifications.reduce((sum, spec) => sum + spec.confidence, 0);
    return totalConfidence / specifications.length;
  }

  /**
   * Extract product information from web search results
   */
  async extractFromWebSearch(manufacturerName: string, productName?: string): Promise<AIExtractionResult[]> {
    try {
      const searchQueries = [
        `${manufacturerName} ${productName || 'microinverter'} specifications datasheet`,
        `${manufacturerName} ${productName || 'microinverter'} technical data`,
        `${manufacturerName} ${productName || 'microinverter'} product information`
      ];

      const results: AIExtractionResult[] = [];

      for (const query of searchQueries) {
        try {
          const searchResults = await searchWeb(query);
          
          for (const result of searchResults) {
            // Only process official sources
            if (isOfficialSource(result.url)) {
              try {
                // Extract content from the webpage
                const content = await this.extractWebpageContent(result.url);
                
                if (content) {
                  const extractionResult = await this.extractSpecifications({
                    content,
                    sourceUrl: result.url,
                    productName: productName,
                    manufacturer: manufacturerName
                  });
                  
                  results.push(extractionResult);
                }
              } catch (contentError) {
                console.error(`Failed to extract content from ${result.url}:`, contentError);
              }
            }
          }
        } catch (searchError) {
          console.error(`Web search failed for query "${query}":`, searchError);
        }
      }

      return results;
    } catch (error) {
      console.error('Web extraction error:', error);
      throw new Error(`Failed to extract from web search: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Extract content from a webpage
   */
  private async extractWebpageContent(url: string): Promise<string | null> {
    try {
      // This would use a web scraping service like Playwright or Cheerio
      // For now, return null - would be implemented with actual web scraping
      console.log(`Extracting content from: ${url}`);
      
      // TODO: Implement actual webpage content extraction
      // This would:
      // 1. Fetch the webpage content
      // 2. Extract relevant text from product pages
      // 3. Clean and normalize the content
      // 4. Return structured text for AI processing
      
      return null;
    } catch (error) {
      console.error(`Failed to extract content from ${url}:`, error);
      return null;
    }
  }

  /**
   * Enhanced product summary generation with factual focus
   */
  async generateFactualProductSummary(productData: {
    name: string;
    manufacturer: string;
    specifications: ProductSpecification[];
    market?: string;
    certifications?: string[];
  }): Promise<string> {
    try {
      const specsText = productData.specifications
        .filter(spec => spec.confidence > 0.7) // Only include high-confidence specs
        .map(spec => `${spec.name}: ${spec.value} ${spec.unit || ''}`)
        .join(', ');

      const certText = productData.certifications?.join(', ') || 'None specified';
      const marketText = productData.market || 'Global';

      const prompt = `
        Generate a concise, factual summary for this microinverter product based ONLY on the verified specifications provided:
        
        Product: ${productData.name}
        Manufacturer: ${productData.manufacturer}
        Market: ${marketText}
        Key Specifications: ${specsText}
        Certifications: ${certText}
        
        Requirements:
        - Be 2-3 sentences long
        - Include only factual information from the specifications
        - Highlight key technical specifications
        - Mention intended market if available
        - Do not include opinions, comparisons, or competitive positioning
        - Do not speculate on performance or suitability
        - Focus on objective technical data only
      `;

      const completion = await getAnthropicClient().messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 300,
        temperature: 0.1,
        system: 'You are an expert in solar energy products. Generate factual, objective product summaries based only on provided technical specifications.',
        messages: [
          { role: 'user', content: prompt }
        ],
      });

      return completion.content[0]?.type === 'text' ? completion.content[0].text.trim() : '';
    } catch (error) {
      console.error('Summary generation error:', error);
      return '';
    }
  }

  /**
   * Normalize and validate extracted specifications
   */
  normalizeSpecifications(specifications: ProductSpecification[]): ProductSpecification[] {
    return specifications.map(spec => {
      const normalized = { ...spec };
      
      // Normalize units — strip unit text from value field
      if (typeof spec.value === 'string') {
        // Remove unit suffixes that accidentally got included in the value
        normalized.value = spec.value
          .replace(/\s*(VDC|VAC|Vdc|Vac|V|W|kW|A|mA|Hz|kg|g|mm|cm|°C|°F|%|years?|lbs?)\s*$/i, '')
          .trim();
      }

      // Normalize numeric values
      if ((spec.unit === 'W' || spec.unit === 'V' || spec.unit === 'A' || spec.unit === 'kg') && typeof spec.value === 'string') {
        const numericValue = parseFloat(spec.value.replace(/[^0-9.\-]/g, ''));
        if (!isNaN(numericValue)) {
          normalized.value = numericValue.toString();
        }
      }
      
      if (spec.unit === '%' && typeof spec.value === 'string') {
        const numericValue = parseFloat(spec.value.replace(/[^0-9.]/g, ''));
        if (!isNaN(numericValue) && numericValue <= 100) {
          normalized.value = numericValue.toString();
        }
      }
      
      // Normalize ranges — standardize separator to single hyphen
      if (typeof spec.value === 'string') {
        const rangeMatch = spec.value.match(/(-?\d+(?:\.\d+)?)\s*[-–—~to]+\s*(-?\d+(?:\.\d+)?)/i);
        if (rangeMatch) {
          normalized.value = `${rangeMatch[1]}-${rangeMatch[2]}`;
        }
      }

      // Normalize weight — convert lbs to kg
      if (spec.name === 'Weight' && typeof spec.value === 'string') {
        if (spec.value.toLowerCase().includes('lb')) {
          const lbs = parseFloat(spec.value.replace(/[^0-9.]/g, ''));
          if (!isNaN(lbs)) {
            normalized.value = (lbs * 0.4536).toFixed(2);
            normalized.unit = 'kg';
          }
        }
      }
      
      return normalized;
    });
  }

  /**
   * Validate extracted specifications against expected ranges.
   * Flags impossible values by lowering confidence; does NOT remove them.
   */
  validateExtractedSpecs(specifications: ProductSpecification[]): ProductSpecification[] {
    // Range checks: [fieldName pattern, min, max]
    const rangeChecks: [RegExp, number, number][] = [
      [/maximum ac output power/i, 50, 10000],     // 50W – 10kW
      [/maximum dc input power/i, 50, 15000],       // 50W – 15kW
      [/peak efficiency/i, 85, 99.99],               // 85% – 99.99%
      [/cec weighted efficiency/i, 85, 99.99],
      [/european weighted efficiency/i, 85, 99.99],
      [/maximum input voltage/i, 10, 1500],          // 10V – 1500V
      [/maximum input current/i, 0.1, 100],          // 0.1A – 100A
      [/maximum short circuit/i, 0.1, 100],
      [/maximum output current/i, 0.1, 100],
      [/start-up voltage/i, 1, 500],
      [/weight/i, 0.05, 100],                        // 50g – 100kg
      [/standard warranty/i, 1, 50],                  // 1–50 years
      [/number of mppts/i, 1, 8],
      [/thd/i, 0.1, 10],                             // 0.1% – 10%
      [/night consumption/i, 0, 5],                   // 0W – 5W (often in mW)
    ];

    return specifications.map(spec => {
      const validated = { ...spec };
      
      for (const [pattern, min, max] of rangeChecks) {
        if (pattern.test(spec.name)) {
          const numVal = parseFloat(spec.value);
          if (!isNaN(numVal) && (numVal < min || numVal > max)) {
            console.warn(`[Validation] "${spec.name}" value ${numVal} outside expected range [${min}, ${max}] — lowering confidence`);
            validated.confidence = Math.min(validated.confidence, 0.3);
            validated.isVerified = false;
          }
          break;
        }
      }

      // Flag empty or suspiciously short values
      if (!spec.value || spec.value.trim().length === 0) {
        validated.confidence = 0;
      }

      return validated;
    }).filter(spec => spec.confidence > 0); // Remove completely empty specs
  }

  /**
   * Second-pass extraction: re-prompt for mandatory fields that were missed
   */
  async extractMissingFields(
    existingSpecs: ProductSpecification[],
    documentText: string,
    request: ExtractionRequest
  ): Promise<ProductSpecification[]> {
    const requiredTemplates = SPECIFICATION_TEMPLATES.filter(t => t.required);
    const existingNames = new Set(existingSpecs.map(s => s.name.toLowerCase()));
    
    const missingFields = requiredTemplates.filter(t => !existingNames.has(t.name.toLowerCase()));
    
    if (missingFields.length === 0) {
      return existingSpecs; // All mandatory fields found
    }

    console.log(`[Second-pass] ${missingFields.length} required fields missing: ${missingFields.map(f => f.name).join(', ')}`);

    const missingList = missingFields
      .map(f => `- "${f.name}" (${f.category}): ${f.description}${f.aliases ? ` — also labeled as: ${f.aliases.join(', ')}` : ''}`)
      .join('\n');

    const prompt = `The following REQUIRED specification fields were NOT found in the initial extraction. Please search the document text AGAIN specifically for these fields.

MISSING FIELDS:
${missingList}

DOCUMENT TEXT:
${documentText.slice(0, 8000)}

Instructions:
- Search carefully for each missing field, including any alternate label names.
- Return ONLY the fields you can find. Do NOT guess or fabricate values.
- Use the exact "name" from the list above.
- Include "sourceText" with the verbatim quote.
- Return JSON format: { "specifications": [...] }
- If a field truly is not in the document, do not include it.`;

    try {
      const completion = await getAnthropicClient().messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 2048,
        temperature: 0.05,
        system: 'You are a precise technical data extractor. Extract ONLY values that are explicitly present in the document. Never guess.',
        messages: [{ role: 'user', content: prompt }],
      });

      const response = completion.content[0]?.type === 'text' ? completion.content[0].text : null;
      if (!response) return existingSpecs;

      const parsed = this.parseAIResponse(response);
      if (!parsed.specifications || !Array.isArray(parsed.specifications)) return existingSpecs;

      const newSpecs = this.calculateConfidenceScores(parsed.specifications, request);
      const normalized = this.normalizeSpecifications(newSpecs);
      const validated = this.validateExtractedSpecs(normalized);

      console.log(`[Second-pass] Recovered ${validated.length} additional specs`);

      // Merge — only add genuinely new fields
      const merged = [...existingSpecs];
      for (const spec of validated) {
        if (!existingNames.has(spec.name.toLowerCase())) {
          merged.push(spec);
        }
      }

      return merged;
    } catch (error) {
      console.error('[Second-pass] extraction failed:', error);
      return existingSpecs;
    }
  }

  /**
   * Detect duplicate products based on specifications
   */
  detectDuplicates(products: Array<{ name: string; manufacturer: string; specifications: ProductSpecification[] }>): Array<{ product: any; duplicates: any[]; confidence: number }> {
    const duplicates: Array<{ product: any; duplicates: any[]; confidence: number }> = [];
    
    for (let i = 0; i < products.length; i++) {
      const product = products[i];
      const productSpecs = new Map(
        product.specifications.map(spec => [spec.name, spec.value])
      );
      
      const similarProducts: any[] = [];
      
      for (let j = i + 1; j < products.length; j++) {
        const otherProduct = products[j];
        const otherSpecs = new Map(
          otherProduct.specifications.map(spec => [spec.name, spec.value])
        );
        
        // Calculate similarity based on key specifications
        const keySpecs = ['Maximum Power', 'Max DC Power', 'Peak Efficiency', 'No. of MPPTs'];
        let matches = 0;
        let totalChecked = 0;
        
        for (const keySpec of keySpecs) {
          const productValue = productSpecs.get(keySpec);
          const otherValue = otherSpecs.get(keySpec);
          
          if (productValue && otherValue) {
            totalChecked++;
            if (productValue === otherValue) {
              matches++;
            }
          }
        }
        
        if (totalChecked > 0) {
          const similarity = matches / totalChecked;
          if (similarity >= 0.8) { // 80% similarity threshold
            similarProducts.push({
              product: otherProduct,
              similarity
            });
          }
        }
      }
      
      if (similarProducts.length > 0) {
        duplicates.push({
          product,
          duplicates: similarProducts,
          confidence: similarProducts.reduce((sum, dup) => sum + dup.similarity, 0) / similarProducts.length
        });
      }
    }
    
    return duplicates;
  }
}

export const aiExtractionService = new AIExtractionService();
