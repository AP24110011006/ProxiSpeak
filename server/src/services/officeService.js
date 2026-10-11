import { Office } from '../models/Office.js';

export const DEFAULT_OFFICE_SLUG = 'infotact-hq';

export class OfficeService {
  /**
   * Seed the default office layout if it doesn't already exist in the database
   */
  async ensureDefaultOffice() {
    try {
      let defaultOffice = await Office.findOne({ slug: DEFAULT_OFFICE_SLUG });
      if (defaultOffice) {
        return defaultOffice;
      }

      console.log('[OfficeService] Seeding default office layout...');
      defaultOffice = await Office.create({
        name: 'Infotact Virtual Headquarters',
        slug: DEFAULT_OFFICE_SLUG,
        description: 'Main 2D interactive office space with conference rooms and collaboration pods',
        width: 1600,
        height: 1000,
        theme: 'modern-wood',
        isDefault: true,
        spawnPoint: { x: 300, y: 300 },
        location: {
          type: 'Point',
          coordinates: [800, 500],
        },
        zones: [
          {
            id: 'conf_a',
            name: 'Boardroom Alpha',
            x: 950,
            y: 80,
            width: 550,
            height: 380,
            color: '#E0F2FE', // sky-100
            isQuietZone: false,
            soundIsolation: 0.85,
          },
          {
            id: 'lounge_zone',
            name: 'Cafeteria & Lounge',
            x: 80,
            y: 560,
            width: 480,
            height: 360,
            color: '#FEF3C7', // amber-100
            isQuietZone: false,
            soundIsolation: 0.4,
          },
          {
            id: 'quiet_zone',
            name: 'Quiet Focus Pods',
            x: 1050,
            y: 560,
            width: 450,
            height: 360,
            color: '#F3E8FF', // purple-100
            isQuietZone: true,
            soundIsolation: 0.9,
          },
        ],
        obstacles: [
          // Perimeter outer boundary walls are handled by canvas, but internal room walls:
          // Conference Room Alpha Walls
          {
            id: 'wall_conf_left',
            type: 'wall',
            label: 'Glass Partition Left',
            x: 950,
            y: 80,
            width: 14,
            height: 380,
            blocksMovement: true,
            soundDamping: 0.85,
            color: '#0284C7',
          },
          {
            id: 'wall_conf_bottom',
            type: 'wall',
            label: 'Glass Partition Bottom',
            x: 950,
            y: 460,
            width: 550,
            height: 14,
            blocksMovement: true,
            soundDamping: 0.85,
            color: '#0284C7',
          },
          // Conference Table & Chairs inside Boardroom Alpha
          {
            id: 'table_conf_alpha',
            type: 'table',
            label: 'Mahogany Conference Table',
            x: 1080,
            y: 190,
            width: 280,
            height: 140,
            blocksMovement: true,
            soundDamping: 0.2,
            color: '#78350F',
          },
          // Engineering Pod Desks (Cluster 1)
          {
            id: 'desk_eng_1',
            type: 'desk',
            label: 'Dev Desk Alpha',
            x: 200,
            y: 150,
            width: 180,
            height: 90,
            blocksMovement: true,
            soundDamping: 0.3,
            color: '#475569',
          },
          {
            id: 'desk_eng_2',
            type: 'desk',
            label: 'Dev Desk Beta',
            x: 440,
            y: 150,
            width: 180,
            height: 90,
            blocksMovement: true,
            soundDamping: 0.3,
            color: '#475569',
          },
          {
            id: 'desk_eng_3',
            type: 'desk',
            label: 'Dev Desk Gamma',
            x: 680,
            y: 150,
            width: 180,
            height: 90,
            blocksMovement: true,
            soundDamping: 0.3,
            color: '#475569',
          },
          // Engineering Pod Desks (Cluster 2)
          {
            id: 'desk_eng_4',
            type: 'desk',
            label: 'Design Desk Delta',
            x: 200,
            y: 350,
            width: 180,
            height: 90,
            blocksMovement: true,
            soundDamping: 0.3,
            color: '#475569',
          },
          {
            id: 'desk_eng_5',
            type: 'desk',
            label: 'Design Desk Epsilon',
            x: 440,
            y: 350,
            width: 180,
            height: 90,
            blocksMovement: true,
            soundDamping: 0.3,
            color: '#475569',
          },
          // Water Cooler / Break Area
          {
            id: 'cooler_pantry',
            type: 'cooler',
            label: 'Water Cooler & Coffee Bar',
            x: 120,
            y: 620,
            width: 60,
            height: 60,
            blocksMovement: true,
            soundDamping: 0.1,
            color: '#06B6D4',
          },
          {
            id: 'table_cafe',
            type: 'table',
            label: 'Cafeteria High Table',
            x: 250,
            y: 680,
            width: 160,
            height: 100,
            blocksMovement: true,
            soundDamping: 0.2,
            color: '#D97706',
          },
          // Whiteboard
          {
            id: 'whiteboard_main',
            type: 'whiteboard',
            label: 'Ideation Whiteboard',
            x: 680,
            y: 360,
            width: 160,
            height: 20,
            blocksMovement: true,
            soundDamping: 0.4,
            color: '#E2E8F0',
          },
          // Decorative Plants
          {
            id: 'plant_corner_1',
            type: 'plant',
            label: 'Fiddle Leaf Fig',
            x: 40,
            y: 40,
            width: 50,
            height: 50,
            blocksMovement: true,
            soundDamping: 0.05,
            color: '#16A34A',
          },
          {
            id: 'plant_conf_corner',
            type: 'plant',
            label: 'Monstera Plant',
            x: 970,
            y: 100,
            width: 45,
            height: 45,
            blocksMovement: true,
            soundDamping: 0.05,
            color: '#16A34A',
          },
        ],
      });

      console.log('[OfficeService] Default office initialized successfully.');
      return defaultOffice;
    } catch (error) {
      console.error('[OfficeService] Error ensuring default office:', error.message);
      // Fallback in-memory office object if MongoDB is connecting
      return {
        _id: 'default_office_fallback',
        name: 'Infotact Virtual Headquarters',
        slug: DEFAULT_OFFICE_SLUG,
        width: 1600,
        height: 1000,
        spawnPoint: { x: 300, y: 300 },
        obstacles: [],
        zones: [],
      };
    }
  }

  async getOfficeBySlug(slug) {
    let office = await Office.findOne({ slug });
    if (!office && slug === DEFAULT_OFFICE_SLUG) {
      office = await this.ensureDefaultOffice();
    }
    return office;
  }

  async getAllOffices() {
    return Office.find().select('name slug width height description').lean();
  }
}

export const officeService = new OfficeService();
