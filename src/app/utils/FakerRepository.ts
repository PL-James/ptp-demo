import { RamFlavour } from '@decaf-ts/core/ram';
import { uses } from '@decaf-ts/decoration';
import { Model, ModelConstructor } from '@decaf-ts/decorator-validation';
import { DecafFakerRepository, DecafRepository, getModelAndRepository } from '@decaf-ts/for-angular';
import { Audit, AuditOperations, Batch, Leaflet, LeafletType, Product, UserGroup } from '@pharmaledgerassoc/ptp-toolkit/shared';
import { DbAdapterFlavour } from '../app.config';
import { generateGtin } from '../handlers/ProductHandler';

enum ProductNames {
  aspirin = 'Aspirin',
  ibuprofen = 'Ibuprofen',
  paracetamol = 'Paracetamol',
  amoxicillin = 'Amoxicillin',
  azithromycin = 'Azithromycin',
  metformin = 'Metformin',
  atorvastatin = 'Atorvastatin',
  omeprazole = 'Omeprazole',
  simvastatin = 'Simvastatin',
  levothyroxine = 'Levothyroxine',
  lisinopril = 'Lisinopril',
  losartan = 'Losartan',
  hydrochlorothiazide = 'Hydrochlorothiazide',
}

// Realistic pharma demo data
const DEMO_PRODUCTS: Partial<Product>[] = [
  { inventedName: 'Aspirin', nameMedicinalProduct: 'Acetylsalicylic Acid 500mg', productRecall: false },
  { inventedName: 'Metformin XR', nameMedicinalProduct: 'Metformin Hydrochloride 1000mg Extended Release', productRecall: false },
  { inventedName: 'Atorvastatin', nameMedicinalProduct: 'Atorvastatin Calcium 20mg', productRecall: false },
  { inventedName: 'Omeprazole DR', nameMedicinalProduct: 'Omeprazole Delayed-Release 40mg', productRecall: false },
  { inventedName: 'Amoxicillin', nameMedicinalProduct: 'Amoxicillin Trihydrate 500mg', productRecall: false },
  { inventedName: 'Losartan', nameMedicinalProduct: 'Losartan Potassium 50mg', productRecall: false },
  { inventedName: 'Levothyroxine', nameMedicinalProduct: 'Levothyroxine Sodium 100mcg', productRecall: false },
  { inventedName: 'Ibuprofen', nameMedicinalProduct: 'Ibuprofen 400mg Film-Coated', productRecall: true },
];

const DEMO_USERS = [
  'james.gannon@pharmaledger.org',
  'ana.silva@pharmaledger.org',
  'marc.dupont@pharmaledger.org',
  'sarah.chen@pharmaledger.org',
  'demerson.carvalho@pharmaledger.org',
];

const DEMO_MARKETS = ['EU', 'US', 'BR', 'CH', 'DE', 'PT', 'FR', 'UK'];
const DEMO_LANGS = ['en', 'pt-br', 'de', 'fr'];

// Store product codes for cross-referencing
const generatedProductCodes: string[] = [];

export async function populateSampleData(models: Model[], populate: string[], limit: number = 12): Promise<void> {
  if (DbAdapterFlavour.includes(RamFlavour)) {
    for (let model of models) {
      if (model instanceof Function) {
        model = new (model as unknown as ModelConstructor<Model>)();
      }
      const name = model.constructor.name.replace(/[0-9]/g, '');
      if (populate.includes(name)) {
        uses(RamFlavour)(model);
        const repository = new FakerRepository(model, limit);
        await repository.initialize();
      }
    }
  }
}

async function getQueryResults<M extends Model>(modelName: string): Promise<M[]> {
  const repo = getModelAndRepository(modelName);
  if (repo) {
    const { repository } = repo;
    const query = await repository.select().execute();
    if (query.length) {
      return query as M[];
    }
  }
  return [];
}

export class FakerRepository<T extends Model> extends DecafFakerRepository<T> {
  public override async initialize(): Promise<void> {
    await super.initialize();
    const repo = this._repository as DecafRepository<Model>;
    const model = this.model as Model;
    let data = await repo.select().execute();
    const now = new Date();
    if (!this.data?.length) {
      const name = model.constructor.name;
      switch (name) {
        case Product.name: {
          this.limit = DEMO_PRODUCTS.length;
          this.propFnMapper = {
            productCode: () => generateGtin(),
          };
          data = (await this.generateData(ProductNames, 'inventedName', 'string')).map((item: Partial<Product>, index: number) => {
            const demo = DEMO_PRODUCTS[index] || DEMO_PRODUCTS[0];
            const productCode = item.productCode || generateGtin();
            generatedProductCodes.push(productCode);
            delete item.imageData;
            item.inventedName = demo.inventedName!;
            item.nameMedicinalProduct = demo.nameMedicinalProduct!;
            item.productRecall = demo.productRecall!;
            item.markets = [];
            item.strengths = [];
            return Model.build({ ...item, ...{ createdAt: now, updatedAt: now } }, Product.name) as T;
          });
          break;
        }
        case Batch.name: {
          // Generate 2-3 batches per product
          const products = await getQueryResults<Product>('Product');
          const batchData: Partial<Batch>[] = [];
          const expiryDates = ['261200', '270600', '271200', '280300', '260900', '270100'];
          let batchIndex = 0;

          for (const product of products.slice(0, 6)) {
            const batchCount = 2 + Math.floor(Math.random() * 2); // 2-3 batches
            for (let i = 0; i < batchCount; i++) {
              const batchNumber = `BT-${product.productCode?.slice(-4)}-${String(batchIndex + 1).padStart(3, '0')}`;
              batchData.push({
                productCode: product.productCode,
                batchNumber: batchNumber,
                expiryDate: expiryDates[batchIndex % expiryDates.length] as any,
                batchRecall: batchIndex === 5, // one recalled batch
                owner: DEMO_USERS[batchIndex % DEMO_USERS.length],
                createdAt: new Date(now.getTime() - (30 - batchIndex) * 86400000),
                updatedAt: new Date(now.getTime() - batchIndex * 86400000),
              } as any);
              batchIndex++;
            }
          }

          data = batchData.map((item) => Model.build(item, Batch.name)) as T[];
          break;
        }
        case Leaflet.name: {
          const products = await getQueryResults<Product>('Product');
          const leafletData: Partial<Leaflet>[] = [];
          let leafletIndex = 0;

          for (const product of products.slice(0, 5)) {
            // Each product gets a patient leaflet and prescribing info
            for (const type of [LeafletType.leaflet, LeafletType.prescribingInfo]) {
              const lang = DEMO_LANGS[leafletIndex % DEMO_LANGS.length];
              const market = DEMO_MARKETS[leafletIndex % DEMO_MARKETS.length];
              leafletData.push({
                productCode: product.productCode,
                leafletType: type,
                lang: lang,
                epiMarket: market,
                xmlFileContent: `<?xml version="1.0"?><leaflet product="${product.inventedName}" type="${type}" lang="${lang}" />`,
                otherFilesContent: [],
                owner: DEMO_USERS[leafletIndex % DEMO_USERS.length],
                createdAt: new Date(now.getTime() - (60 - leafletIndex * 3) * 86400000),
                updatedAt: new Date(now.getTime() - leafletIndex * 86400000),
              } as any);
              leafletIndex++;
            }
          }

          data = leafletData.map((item) => Model.build(item, Leaflet.name)) as T[];
          break;
        }
        case Audit.name: {
          const auditActions = Object.values(AuditOperations);
          const userGroups = Object.values(UserGroup);
          const tables = ['product', 'batch', 'leaflet', 'account'];
          const transactions = ['create', 'read', 'update', 'delete'];
          const auditData: Partial<Audit>[] = [];

          for (let i = 0; i < 15; i++) {
            const diffs: Record<string, any> = {};
            if (i % 3 === 0) {
              diffs['inventedName'] = { from: 'Old Name', to: 'Updated Name' };
            }
            if (i % 4 === 0) {
              diffs['expiryDate'] = { from: '261200', to: '271200' };
            }
            auditData.push({
              userId: DEMO_USERS[i % DEMO_USERS.length],
              userGroup: userGroups[i % userGroups.length],
              model: tables[i % tables.length],
              transaction: transactions[i % transactions.length],
              action: auditActions[i % auditActions.length],
              diffs: Object.keys(diffs).length ? diffs : undefined,
              owner: 'PharmaLedger',
              createdAt: new Date(now.getTime() - i * 3600000), // hourly entries
              updatedAt: new Date(now.getTime() - i * 3600000),
            } as any);
          }

          data = auditData.map((item) => Model.build(item, Audit.name)) as T[];
          break;
        }
        default:
          break;
      }
      try {
        const timestampProps = ['createdAt', 'updatedAt'];
        const now = new Date();

        data = await this.repository?.createAll(data as Model[]);
      } catch (error: unknown) {
        this.log
          .for(this.initialize)
          .error(
            `Error on populate ${this.model?.constructor.name}: ${(error as Error)?.message || (error as string)}`
          );
      }
    }
    this.data = data as T[];
  }
}
