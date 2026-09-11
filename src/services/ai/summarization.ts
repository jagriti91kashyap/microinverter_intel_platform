import OpenAI from 'openai';
import { Product, ProductSpecification, Manufacturer } from '@/types';

let _openai: OpenAI | null = null;
function getOpenAIClient(): OpenAI {
  if (!_openai) {
    if (!process.env.OPENAI_API_KEY) throw new Error('OPENAI_API_KEY environment variable is not set');
    _openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }
  return _openai;
}

export interface ProductSummaryRequest {
  product: Product;
  specifications: ProductSpecification[];
  manufacturer: Manufacturer;
}

export interface MarketInsightRequest {
  products: Product[];
  timeRange?: 'week' | 'month' | 'quarter' | 'year';
  focusArea?: 'efficiency' | 'power' | 'warranty' | 'new_products';
}

export interface ComparisonSummaryRequest {
  products: Product[];
  specifications: ProductSpecification[];
  comparisonCriteria?: string[];
}

export interface ChangeSummaryRequest {
  changes: {
    added: ProductSpecification[];
    removed: ProductSpecification[];
    modified: { old: ProductSpecification; new: ProductSpecification }[];
  };
  productName: string;
  manufacturer: string;
}

export class AISummarizationService {
  /**
   * Generate comprehensive product summary
   */
  async generateProductSummary(request: ProductSummaryRequest): Promise<string> {
    try {
      const { product, specifications, manufacturer } = request;
      
      const prompt = this.buildProductSummaryPrompt(product, specifications, manufacturer);
      
      const completion = await getOpenAIClient().chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: [
          {
            role: 'system',
            content: 'You are an expert in solar energy products and technical writing. Generate comprehensive, factual product summaries based on technical specifications.'
          },
          { role: 'user', content: prompt }
        ],
        temperature: 0.3,
        max_tokens: 400,
      });

      return completion.choices[0]?.message?.content?.trim() || '';
    } catch (error) {
      console.error('Product summary generation error:', error);
      throw new Error(`Failed to generate product summary: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Generate market insights from product data
   */
  async generateMarketInsights(request: MarketInsightRequest): Promise<{
    summary: string;
    trends: string[];
    recommendations: string[];
  }> {
    try {
      const prompt = this.buildMarketInsightsPrompt(request);
      
      const completion = await getOpenAIClient().chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: [
          {
            role: 'system',
            content: 'You are a market analyst specializing in solar energy technology. Provide data-driven insights and recommendations based on product data.'
          },
          { role: 'user', content: prompt }
        ],
        temperature: 0.4,
        max_tokens: 800,
      });

      const response = completion.choices[0]?.message?.content;
      if (!response) {
        throw new Error('No response from OpenAI');
      }

      return this.parseMarketInsightsResponse(response);
    } catch (error) {
      console.error('Market insights generation error:', error);
      throw new Error(`Failed to generate market insights: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Generate product comparison summary
   */
  async generateComparisonSummary(request: ComparisonSummaryRequest): Promise<{
    overview: string;
    keyDifferences: string[];
    recommendations: string[];
  }> {
    try {
      const prompt = this.buildComparisonPrompt(request);
      
      const completion = await getOpenAIClient().chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: [
          {
            role: 'system',
            content: 'You are an expert in solar energy products. Generate objective, factual product comparisons that help users make informed decisions.'
          },
          { role: 'user', content: prompt }
        ],
        temperature: 0.3,
        max_tokens: 600,
      });

      const response = completion.choices[0]?.message?.content;
      if (!response) {
        throw new Error('No response from OpenAI');
      }

      return this.parseComparisonResponse(response);
    } catch (error) {
      console.error('Comparison summary generation error:', error);
      throw new Error(`Failed to generate comparison summary: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Generate change detection summary
   */
  async generateChangeSummary(request: ChangeSummaryRequest): Promise<string> {
    try {
      const prompt = this.buildChangeSummaryPrompt(request);
      
      const completion = await getOpenAIClient().chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: [
          {
            role: 'system',
            content: 'You are a technical analyst specializing in product change detection. Generate clear, factual summaries of product specification changes.'
          },
          { role: 'user', content: prompt }
        ],
        temperature: 0.2,
        max_tokens: 300,
      });

      return completion.choices[0]?.message?.content?.trim() || '';
    } catch (error) {
      console.error('Change summary generation error:', error);
      throw new Error(`Failed to generate change summary: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Generate manufacturer overview
   */
  async generateManufacturerOverview(manufacturer: Manufacturer, products: Product[]): Promise<{
    overview: string;
    strengths: string[];
    marketPosition: string;
  }> {
    try {
      const prompt = this.buildManufacturerOverviewPrompt(manufacturer, products);
      
      const completion = await getOpenAIClient().chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: [
          {
            role: 'system',
            content: 'You are an industry analyst specializing in solar energy manufacturers. Provide objective overviews based on product data.'
          },
          { role: 'user', content: prompt }
        ],
        temperature: 0.3,
        max_tokens: 500,
      });

      const response = completion.choices[0]?.message?.content;
      if (!response) {
        throw new Error('No response from OpenAI');
      }

      return this.parseManufacturerOverviewResponse(response);
    } catch (error) {
      console.error('Manufacturer overview generation error:', error);
      throw new Error(`Failed to generate manufacturer overview: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private buildProductSummaryPrompt(
    product: Product,
    specifications: ProductSpecification[],
    manufacturer: Manufacturer
  ): string {
    const specsText = specifications
      .map(spec => `• ${spec.name}: ${spec.value} ${spec.unit || ''}`)
      .join('\n');

    return `
      Generate a comprehensive summary for this microinverter product:
      
      Product Details:
      - Name: ${product.name}
      - Series: ${product.series || 'N/A'}
      - Model: ${product.model || 'N/A'}
      - Manufacturer: ${manufacturer.name}
      - Status: ${product.status}
      
      Key Specifications:
      ${specsText}
      
      Additional Info:
      - AC Power: ${product.acPower || 'N/A'}W
      - DC Power: ${product.maxModuleSize || 'N/A'}W
      - Efficiency: ${product.efficiency || 'N/A'}%
      - Warranty: ${product.warranty || 'N/A'} years
      - No. of MPPTs: ${product.mppt || 'N/A'}
      
      Guidelines:
      - Write 2-3 comprehensive paragraphs
      - Focus on technical capabilities and benefits
      - Highlight unique features or advantages
      - Use professional, industry-standard terminology
      - Be factual and based only on the provided data
      - Include potential applications or use cases
      - Mention any notable efficiency or warranty features
    `;
  }

  private buildMarketInsightsPrompt(request: MarketInsightRequest): string {
    const { products, timeRange = 'month', focusArea } = request;
    
    const productStats = this.calculateProductStats(products);
    
    let prompt = `
      Analyze the following microinverter market data and provide insights:
      
      Time Range: ${timeRange}
      Total Products: ${products.length}
      
      Market Statistics:
      - Average AC Power: ${productStats.avgPower}W
      - Average Efficiency: ${productStats.avgEfficiency}%
      - Average Warranty: ${productStats.avgWarranty} years
      - Power Range: ${productStats.minPower}W - ${productStats.maxPower}W
      - Efficiency Range: ${productStats.minEfficiency}% - ${productStats.maxEfficiency}%
      
      Manufacturer Distribution:
      ${productStats.manufacturerDistribution.map((m: any) => `- ${m.name}: ${m.count} products`).join('\n')}
      
    `;

    if (focusArea) {
      prompt += `\nFocus Area: ${focusArea}\n`;
    }

    prompt += `
      Provide insights in the following JSON format:
      {
        "summary": "Overall market analysis summary",
        "trends": ["trend 1", "trend 2", "trend 3"],
        "recommendations": ["recommendation 1", "recommendation 2"]
      }
      
      Guidelines:
      - Be data-driven and objective
      - Focus on actionable insights
      - Consider market implications
      - Identify emerging patterns
    `;

    return prompt;
  }

  private buildComparisonPrompt(request: ComparisonSummaryRequest): string {
    const { products, specifications, comparisonCriteria } = request;
    
    const productsText = products.map((product, index) => 
      `Product ${index + 1}: ${product.name} (${product.manufacturer?.name})`
    ).join('\n');

    const specsText = specifications
      .map(spec => `• ${spec.name}: ${spec.value} ${spec.unit || ''}`)
      .join('\n');

    let prompt = `
      Compare these microinverter products:
      
      ${productsText}
      
      Specifications being compared:
      ${specsText}
    `;

    if (comparisonCriteria) {
      prompt += `\nFocus on these criteria: ${comparisonCriteria.join(', ')}\n`;
    }

    prompt += `
      Provide analysis in JSON format:
      {
        "overview": "Overall comparison overview",
        "keyDifferences": ["difference 1", "difference 2", "difference 3"],
        "recommendations": ["recommendation 1", "recommendation 2"]
      }
      
      Guidelines:
      - Be objective and factual
      - Focus on practical differences
      - Consider use case implications
      - Provide actionable recommendations
    `;

    return prompt;
  }

  private buildChangeSummaryPrompt(request: ChangeSummaryRequest): string {
    const { changes, productName, manufacturer } = request;
    
    let prompt = `
      Summarize the changes detected for this product:
      
      Product: ${productName}
      Manufacturer: ${manufacturer}
      
      Changes Detected:
    `;

    if (changes.added.length > 0) {
      prompt += `\nAdded Specifications:\n${changes.added.map(s => `• ${s.name}: ${s.value} ${s.unit || ''}`).join('\n')}`;
    }

    if (changes.removed.length > 0) {
      prompt += `\nRemoved Specifications:\n${changes.removed.map(s => `• ${s.name}: ${s.value} ${s.unit || ''}`).join('\n')}`;
    }

    if (changes.modified.length > 0) {
      prompt += `\nModified Specifications:\n${changes.modified.map(m => `• ${m.old.name}: ${m.old.value} → ${m.new.value} ${m.new.unit || ''}`).join('\n')}`;
    }

    prompt += `
      Generate a clear, factual summary of these changes:
      
      Guidelines:
      - Focus on the impact of the changes
      - Highlight significant modifications
      - Maintain professional tone
      - Be concise but comprehensive
      - Avoid speculation about reasons
    `;

    return prompt;
  }

  private buildManufacturerOverviewPrompt(manufacturer: Manufacturer, products: Product[]): string {
    const stats = this.calculateManufacturerStats(products);
    
    return `
      Generate an overview for this solar manufacturer:
      
      Manufacturer: ${manufacturer.name}
      Country: ${manufacturer.country || 'N/A'}
      Website: ${manufacturer.website || 'N/A'}
      Active Products: ${products.length}
      
      Product Portfolio Statistics:
      - Average Power: ${stats.avgPower}W
      - Power Range: ${stats.minPower}W - ${stats.maxPower}W
      - Average Efficiency: ${stats.avgEfficiency}%
      - Average Warranty: ${stats.avgWarranty} years
      - Product Categories: ${stats.categories.join(', ')}
      
      Provide analysis in JSON format:
      {
        "overview": "Manufacturer overview",
        "strengths": ["strength 1", "strength 2"],
        "marketPosition": "Market position analysis"
      }
      
      Guidelines:
      - Be objective and data-driven
      - Focus on technical capabilities
      - Consider market positioning
      - Avoid marketing language
    `;
  }

  private calculateProductStats(products: Product[]): any {
    const validProducts = products.filter(p => p.acPower && p.efficiency);
    
    const powers = validProducts.map(p => p.acPower!);
    const efficiencies = validProducts.map(p => p.efficiency!);
    const warranties = products.filter(p => p.warranty).map(p => p.warranty!);
    
    const manufacturerCounts = products.reduce((acc, product) => {
      const name = product.manufacturer?.name || 'Unknown';
      acc[name] = (acc[name] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      avgPower: powers.length > 0 ? Math.round(powers.reduce((a, b) => a + b, 0) / powers.length) : 0,
      avgEfficiency: efficiencies.length > 0 ? (efficiencies.reduce((a, b) => a + b, 0) / efficiencies.length).toFixed(1) : 0,
      avgWarranty: warranties.length > 0 ? (warranties.reduce((a, b) => a + b, 0) / warranties.length).toFixed(1) : 0,
      minPower: powers.length > 0 ? Math.min(...powers) : 0,
      maxPower: powers.length > 0 ? Math.max(...powers) : 0,
      minEfficiency: efficiencies.length > 0 ? Math.min(...efficiencies) : 0,
      maxEfficiency: efficiencies.length > 0 ? Math.max(...efficiencies) : 0,
      manufacturerDistribution: Object.entries(manufacturerCounts).map(([name, count]) => ({ name, count })),
    };
  }

  private calculateManufacturerStats(products: Product[]): any {
    const powers = products.filter(p => p.acPower).map(p => p.acPower!);
    const efficiencies = products.filter(p => p.efficiency).map(p => p.efficiency!);
    const warranties = products.filter(p => p.warranty).map(p => p.warranty!);
    const series = [...new Set(products.filter(p => p.series).map(p => p.series!))];

    return {
      avgPower: powers.length > 0 ? Math.round(powers.reduce((a, b) => a + b, 0) / powers.length) : 0,
      minPower: powers.length > 0 ? Math.min(...powers) : 0,
      maxPower: powers.length > 0 ? Math.max(...powers) : 0,
      avgEfficiency: efficiencies.length > 0 ? (efficiencies.reduce((a, b) => a + b, 0) / efficiencies.length).toFixed(1) : 0,
      avgWarranty: warranties.length > 0 ? (warranties.reduce((a, b) => a + b, 0) / warranties.length).toFixed(1) : 0,
      categories: series.length > 0 ? series : ['Standard'],
    };
  }

  private parseMarketInsightsResponse(response: string): any {
    try {
      return JSON.parse(response);
    } catch (error) {
      // Fallback if JSON parsing fails
      return {
        summary: response,
        trends: [],
        recommendations: [],
      };
    }
  }

  private parseComparisonResponse(response: string): any {
    try {
      return JSON.parse(response);
    } catch (error) {
      // Fallback if JSON parsing fails
      return {
        overview: response,
        keyDifferences: [],
        recommendations: [],
      };
    }
  }

  private parseManufacturerOverviewResponse(response: string): any {
    try {
      return JSON.parse(response);
    } catch (error) {
      // Fallback if JSON parsing fails
      return {
        overview: response,
        strengths: [],
        marketPosition: '',
      };
    }
  }
}

export const aiSummarizationService = new AISummarizationService();
