import { PrismaClient, ProductStatus, UserRole } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Start seeding...')

  // Create test users with different roles
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@microinverter.com' },
    update: {},
    create: {
      email: 'admin@microinverter.com',
      name: 'System Administrator',
      password: 'hashed-password-admin',
      role: UserRole.ADMIN,
    },
  })

  const editorUser = await prisma.user.upsert({
    where: { email: 'editor@microinverter.com' },
    update: {},
    create: {
      email: 'editor@microinverter.com',
      name: 'Content Editor',
      password: 'hashed-password-editor',
      role: UserRole.EDITOR,
    },
  })

  const viewerUser = await prisma.user.upsert({
    where: { email: 'viewer@microinverter.com' },
    update: {},
    create: {
      email: 'viewer@microinverter.com',
      name: 'Viewer User',
      password: 'hashed-password-viewer',
      role: UserRole.VIEWER,
    },
  })

  console.log('Created users:', { adminUser, editorUser, viewerUser })

  // Create comprehensive manufacturers
  const manufacturers = [
    {
      name: 'Enphase Energy',
      website: 'https://enphase.com',
      country: 'United States',
      description: 'Leading microinverter manufacturer with innovative energy management solutions',
      logoUrl: 'https://enphase.com/sites/default/files/2024-01/enphase-logo.svg',
      isActive: true,
    },
    {
      name: 'SolarEdge Technologies',
      website: 'https://solaredge.com',
      country: 'Israel',
      description: 'Global leader in smart energy technology with power optimizers and inverters',
      logoUrl: 'https://solaredge.com/sites/default/files/solaredge-logo.png',
      isActive: true,
    },
    {
      name: 'SMA Solar Technology',
      website: 'https://sma.de',
      country: 'Germany',
      description: 'German manufacturer of solar inverters and monitoring systems',
      logoUrl: 'https://sma.de/fileadmin/templates/sma/images/logo.svg',
      isActive: true,
    },
    {
      name: 'Huawei Solar',
      website: 'https://solar.huawei.com',
      country: 'China',
      description: 'Leading provider of smart PV solutions and inverters',
      logoUrl: 'https://solar.huawei.com/eu/logo.svg',
      isActive: true,
    },
    {
      name: 'Fronius',
      website: 'https://www.fronius.com',
      country: 'Austria',
      description: 'Austrian manufacturer of welding and solar electronics',
      logoUrl: 'https://www.fronius.com/images/fronius-logo.svg',
      isActive: true,
    },
    {
      name: 'APsystems',
      website: 'https://apsystems.com',
      country: 'United States',
      description: 'Innovative microinverter and energy management solutions',
      logoUrl: 'https://apsystems.com/wp-content/uploads/2021/09/APsystems-logo.png',
      isActive: true,
    }
  ]

  const createdManufacturers = []
  for (const manufacturer of manufacturers) {
    const created = await prisma.manufacturer.upsert({
      where: { name: manufacturer.name },
      update: manufacturer,
      create: manufacturer,
    })
    createdManufacturers.push(created)
  }

  console.log('Created manufacturers:', createdManufacturers.length)

  // Create comprehensive products with real specifications
  const products = [
    // Enphase Products
    {
      name: 'IQ8 Microinverter',
      series: 'IQ8',
      model: 'IQ8A-3-72-208-240-277',
      manufacturerId: createdManufacturers[0].id, // Enphase
      acPower: 345,
      dcPower: 370,
      voltage: 240,
      mppt: 1,
      efficiency: 97.0,
      warranty: 25,
      weight: 3.1,
      dimensions: JSON.stringify({ length: 15.7, width: 8.5, height: 1.5, unit: 'inches' }),
      monitoringPlatform: 'Enphase Enlighten',
      status: ProductStatus.ACTIVE,
      datasheetUrl: 'https://enphase.com/download/iq8-and-iq8-microinverters-data-sheet',
      productUrl: 'https://enphase.com/en-us/products/solar/microinverters/iq8',
      imageUrl: 'https://enphase.com/sites/default/files/2024-01/iq8-microinverter.png',
      aiSummary: 'The IQ8 Microinverter is Enphase\'s latest generation microinverter with 97% efficiency and 25-year warranty.',
      confidenceScore: 0.95,
      lastCrawledAt: new Date(),
      extractedAt: new Date(),
    },
    {
      name: 'IQ8AC Microinverter',
      series: 'IQ8',
      model: 'IQ8AC-72-M-INT',
      manufacturerId: createdManufacturers[0].id, // Enphase
      acPower: 366,
      dcPower: 400,
      voltage: 230,
      mppt: 1,
      efficiency: 97.0,
      warranty: 25,
      weight: 3.1,
      dimensions: JSON.stringify({ length: 15.7, width: 8.5, height: 1.5, unit: 'inches' }),
      monitoringPlatform: 'Enphase Enlighten',
      status: ProductStatus.ACTIVE,
      datasheetUrl: 'https://enphase.com/download/iq8ac-and-iq8hc-microinverters-data-sheet',
      productUrl: 'https://enphase.com/en-au/products/solar/microinverters/iq8ac',
      imageUrl: 'https://enphase.com/sites/default/files/2024-01/iq8ac-microinverter.png',
      aiSummary: 'The IQ8AC Microinverter is designed for 230V markets with 366W AC output and 97% efficiency.',
      confidenceScore: 0.95,
      lastCrawledAt: new Date(),
      extractedAt: new Date(),
    },
    {
      name: 'IQ8H Microinverter',
      series: 'IQ8',
      model: 'IQ8H-72-2-US',
      manufacturerId: createdManufacturers[0].id, // Enphase
      acPower: 384,
      dcPower: 400,
      voltage: 240,
      mppt: 1,
      efficiency: 97.5,
      warranty: 25,
      weight: 3.1,
      dimensions: JSON.stringify({ length: 15.7, width: 8.5, height: 1.5, unit: 'inches' }),
      monitoringPlatform: 'Enphase Enlighten',
      status: ProductStatus.ACTIVE,
      datasheetUrl: 'https://enphase.com/download/iq8h-microinverter-data-sheet',
      productUrl: 'https://enphase.com/en-us/products/solar/microinverters/iq8h',
      imageUrl: 'https://enphase.com/sites/default/files/2024-01/iq8h-microinverter.png',
      aiSummary: 'The IQ8H Microinverter is Enphase\'s high-power microinverter with 384W AC output and 97.5% efficiency.',
      confidenceScore: 0.95,
      lastCrawledAt: new Date(),
      extractedAt: new Date(),
    },
    // SolarEdge Products
    {
      name: 'HD-Wave Inverter',
      series: 'HD-Wave',
      model: 'SE3000H-US',
      manufacturerId: createdManufacturers[1].id, // SolarEdge
      acPower: 3000,
      dcPower: 3500,
      voltage: 240,
      mppt: 2,
      efficiency: 99.0,
      warranty: 12,
      weight: 21.1,
      dimensions: JSON.stringify({ length: 27.6, width: 14.6, height: 9.6, unit: 'inches' }),
      monitoringPlatform: 'SolarEdge Monitoring Platform',
      status: ProductStatus.ACTIVE,
      datasheetUrl: 'https://www.solaredge.com/sites/default/files/se3000h-us-datasheet.pdf',
      productUrl: 'https://www.solaredge.com/products/inverters/residential/hd-wave/single-phase-inverter/se3000h',
      imageUrl: 'https://www.solaredge.com/sites/default/files/se3000h-inverter.png',
      aiSummary: 'The HD-Wave Inverter from SolarEdge offers 99% efficiency with advanced power optimization technology.',
      confidenceScore: 0.95,
      lastCrawledAt: new Date(),
      extractedAt: new Date(),
    },
    {
      name: 'Power Optimizer',
      series: 'P-Series',
      model: 'P600',
      manufacturerId: createdManufacturers[1].id, // SolarEdge
      acPower: 600,
      dcPower: 620,
      voltage: 48,
      mppt: 1,
      efficiency: 99.5,
      warranty: 25,
      weight: 2.3,
      dimensions: JSON.stringify({ length: 10.2, width: 6.7, height: 1.3, unit: 'inches' }),
      monitoringPlatform: 'SolarEdge Monitoring Platform',
      status: ProductStatus.ACTIVE,
      datasheetUrl: 'https://www.solaredge.com/sites/default/files/p600-optimizer-datasheet.pdf',
      productUrl: 'https://www.solaredge.com/products/power-optimizers/p-series',
      imageUrl: 'https://www.solaredge.com/sites/default/files/p600-optimizer.png',
      aiSummary: 'The P600 Power Optimizer provides 99.5% efficiency with 25-year warranty for residential solar systems.',
      confidenceScore: 0.95,
      lastCrawledAt: new Date(),
      extractedAt: new Date(),
    },
    // SMA Products
    {
      name: 'Sunny Boy Inverter',
      series: 'Sunny Boy',
      model: 'SB3.0-1AV-40',
      manufacturerId: createdManufacturers[2].id, // SMA
      acPower: 3000,
      dcPower: 3200,
      voltage: 240,
      mppt: 2,
      efficiency: 97.5,
      warranty: 10,
      weight: 17.5,
      dimensions: JSON.stringify({ length: 19.7, width: 16.9, height: 8.1, unit: 'inches' }),
      monitoringPlatform: 'SMA Sunny Portal',
      status: ProductStatus.ACTIVE,
      datasheetUrl: 'https://files.sma.de/dl/20165/SB30-1AV-40-DEN1722W.pdf',
      productUrl: 'https://www.sma.de/en/products/solar-inverters/sunny-boy-1.5-2.5-3.0-3.5.html',
      imageUrl: 'https://www.sma.de/fileadmin/templates/sma/images/products/sunny-boy.png',
      aiSummary: 'The Sunny Boy 3.0 inverter from SMA provides 97.5% efficiency with German engineering quality.',
      confidenceScore: 0.95,
      lastCrawledAt: new Date(),
      extractedAt: new Date(),
    },
    // Huawei Products
    {
      name: 'SUN2000 Inverter',
      series: 'SUN2000',
      model: 'SUN2000-3KTL-US',
      manufacturerId: createdManufacturers[3].id, // Huawei
      acPower: 3000,
      dcPower: 3200,
      voltage: 240,
      mppt: 2,
      efficiency: 98.4,
      warranty: 10,
      weight: 18.5,
      dimensions: JSON.stringify({ length: 20.5, width: 14.2, height: 8.7, unit: 'inches' }),
      monitoringPlatform: 'Huawei FusionSolar',
      status: ProductStatus.ACTIVE,
      datasheetUrl: 'https://solar.huawei.com/eu/products/solar-inverter/sun2000-3ktl-us',
      productUrl: 'https://solar.huawei.com/eu/products/solar-inverter/sun2000-series',
      imageUrl: 'https://solar.huawei.com/eu/media/products/sun2000-inverter.png',
      aiSummary: 'The SUN2000-3KTL-US inverter from Huawei offers 98.4% efficiency with smart string monitoring.',
      confidenceScore: 0.95,
      lastCrawledAt: new Date(),
      extractedAt: new Date(),
    },
    // Fronius Products
    {
      name: 'Primo Inverter',
      series: 'Primo',
      model: 'Fronius Primo 3.0-1',
      manufacturerId: createdManufacturers[4].id, // Fronius
      acPower: 3000,
      dcPower: 3200,
      voltage: 240,
      mppt: 2,
      efficiency: 97.6,
      warranty: 10,
      weight: 19.8,
      dimensions: JSON.stringify({ length: 21.3, width: 16.5, height: 8.9, unit: 'inches' }),
      monitoringPlatform: 'Fronius Solar.web',
      status: ProductStatus.ACTIVE,
      datasheetUrl: 'https://www.fronius.com/en/photovoltaics/products/solar-inverters/fronius-primo',
      productUrl: 'https://www.fronius.com/en/photovoltaics/products/solar-inverters/fronius-primo',
      imageUrl: 'https://www.fronius.com/images/fronius-primo-inverter.png',
      aiSummary: 'The Fronius Primo 3.0-1 inverter provides 97.6% efficiency with Austrian quality and reliability.',
      confidenceScore: 0.95,
      lastCrawledAt: new Date(),
      extractedAt: new Date(),
    },
    // APsystems Products
    {
      name: 'QS1 Microinverter',
      series: 'QS1',
      model: 'QS1A',
      manufacturerId: createdManufacturers[5].id, // APsystems
      acPower: 480,
      dcPower: 500,
      voltage: 240,
      mppt: 4,
      efficiency: 96.5,
      warranty: 25,
      weight: 6.8,
      dimensions: JSON.stringify({ length: 16.5, width: 10.2, height: 2.1, unit: 'inches' }),
      monitoringPlatform: 'APsystems EMA',
      status: ProductStatus.ACTIVE,
      datasheetUrl: 'https://apsystems.com/wp-content/uploads/2021/09/QS1-Datasheet.pdf',
      productUrl: 'https://apsystems.com/products/qs1-microinverter',
      imageUrl: 'https://apsystems.com/wp-content/uploads/2021/09/QS1-microinverter.png',
      aiSummary: 'The QS1 Microinverter from APsystems offers 480W AC output with 4 MPPTs for flexible system design.',
      confidenceScore: 0.95,
      lastCrawledAt: new Date(),
      extractedAt: new Date(),
    }
  ]

  const createdProducts = []
  for (const product of products) {
    try {
      const created = await prisma.product.create({
        data: product,
      })
      createdProducts.push(created)
    } catch (error) {
      console.log('Product already exists or error:', product.name, error)
    }
  }

  console.log('Created products:', createdProducts.length)

  // Create sample product specifications
  const specifications = [
    // Enphase IQ8 specifications
    {
      productId: createdProducts[0]?.id,
      category: 'Electrical',
      name: 'Maximum AC Power',
      value: '345',
      unit: 'W',
      description: 'Maximum continuous AC power output',
      confidence: 0.95,
      extractedAt: new Date(),
      sourceUrl: 'https://enphase.com/download/iq8-and-iq8-microinverters-data-sheet',
    },
    {
      productId: createdProducts[0]?.id,
      category: 'Electrical',
      name: 'Peak Efficiency',
      value: '97.0',
      unit: '%',
      description: 'Maximum conversion efficiency',
      confidence: 0.95,
      extractedAt: new Date(),
      sourceUrl: 'https://enphase.com/download/iq8-and-iq8-microinverters-data-sheet',
    },
    {
      productId: createdProducts[0]?.id,
      category: 'Mechanical',
      name: 'Weight',
      value: '3.1',
      unit: 'kg',
      description: 'Total weight of the microinverter',
      confidence: 0.95,
      extractedAt: new Date(),
      sourceUrl: 'https://enphase.com/download/iq8-and-iq8-microinverters-data-sheet',
    },
    {
      productId: createdProducts[0]?.id,
      category: 'Environmental',
      name: 'Operating Temperature',
      value: '-40 to 85',
      unit: '°C',
      description: 'Ambient temperature range for operation',
      confidence: 0.95,
      extractedAt: new Date(),
      sourceUrl: 'https://enphase.com/download/iq8-and-iq8-microinverters-data-sheet',
    },
  ]

  const createdSpecifications = []
  for (const spec of specifications) {
    if (spec.productId) {
      try {
        const created = await prisma.productSpecification.create({
          data: spec,
        })
        createdSpecifications.push(created)
      } catch (error) {
        console.log('Specification already exists or error:', spec.name, error)
      }
    }
  }

  console.log('Created specifications:', createdSpecifications.length)

  // Create sample certifications
  const certifications = [
    {
      productId: createdProducts[0]?.id,
      country: 'United States',
      standard: 'UL 1741',
      certified: true,
      dateObtained: new Date('2020-01-15'),
      documentUrl: 'https://enphase.com/certifications/ul-1741',
    },
    {
      productId: createdProducts[0]?.id,
      country: 'Canada',
      standard: 'CSA C22.2',
      certified: true,
      dateObtained: new Date('2020-02-20'),
      documentUrl: 'https://enphase.com/certifications/csa-c22.2',
    },
    {
      productId: createdProducts[0]?.id,
      country: 'European Union',
      standard: 'IEC 62109',
      certified: true,
      dateObtained: new Date('2019-11-10'),
      documentUrl: 'https://enphase.com/certifications/iec-62109',
    },
  ]

  const createdCertifications = []
  for (const cert of certifications) {
    if (cert.productId) {
      try {
        const created = await prisma.productCertification.create({
          data: cert,
        })
        createdCertifications.push(created)
      } catch (error) {
        console.log('Certification already exists or error:', cert.standard, error)
      }
    }
  }

  console.log('Created certifications:', createdCertifications.length)

  // Create sample data sources
  const dataSources = [
    {
      productId: createdProducts[0]?.id,
      url: 'https://enphase.com/download/iq8-and-iq8-microinverters-data-sheet',
      type: 'DATASHEET' as const,
      title: 'IQ8 Microinverter Datasheet',
      isActive: true,
    },
    {
      productId: createdProducts[0]?.id,
      url: 'https://enphase.com/en-us/products/solar/microinverters/iq8',
      type: 'WEBSITE' as const,
      title: 'IQ8 Product Page',
      isActive: true,
    },
    {
      manufacturerId: createdManufacturers[0].id,
      url: 'https://enphase.com/products',
      type: 'WEBSITE' as const,
      title: 'Enphase Products',
      isActive: true,
    },
  ]

  const createdDataSources = []
  for (const source of dataSources) {
    try {
      const created = await prisma.dataSource.create({
        data: source as any,
      })
      createdDataSources.push(created)
    } catch (error) {
      console.log('Data source already exists or error:', source.title, error)
    }
  }

  console.log('Created data sources:', createdDataSources.length)

  console.log('Seeding finished successfully!')
  console.log(`Summary:`)
  console.log(`- Users: 3`)
  console.log(`- Manufacturers: ${createdManufacturers.length}`)
  console.log(`- Products: ${createdProducts.length}`)
  console.log(`- Specifications: ${createdSpecifications.length}`)
  console.log(`- Certifications: ${createdCertifications.length}`)
  console.log(`- Data Sources: ${createdDataSources.length}`)
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
