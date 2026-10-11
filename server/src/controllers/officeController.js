import { Office } from '../models/Office.js';
import { officeService } from '../services/officeService.js';
import { proximityService } from '../services/proximityService.js';
import { presenceService } from '../services/presenceService.js';

export const getOffices = async (req, res, next) => {
  try {
    let offices = await officeService.getAllOffices();
    if (!offices || offices.length === 0) {
      const defaultOffice = await officeService.ensureDefaultOffice();
      offices = [defaultOffice];
    }
    res.json({ success: true, offices });
  } catch (error) {
    next(error);
  }
};

export const getOfficeBySlug = async (req, res, next) => {
  try {
    const { slug } = req.params;
    const office = await officeService.getOfficeBySlug(slug);
    if (!office) {
      return res.status(404).json({ success: false, message: 'Office not found' });
    }

    const activeUsers = presenceService.getOfficeUsers(office._id.toString());

    res.json({
      success: true,
      office,
      activeUsers,
    });
  } catch (error) {
    next(error);
  }
};

export const createOffice = async (req, res, next) => {
  try {
    const { name, slug, description, width, height, theme, obstacles, zones } = req.body;

    const existing = await Office.findOne({ slug: slug.toLowerCase() });
    if (existing) {
      return res.status(409).json({ success: false, message: 'An office with this slug already exists' });
    }

    const office = await Office.create({
      name,
      slug: slug.toLowerCase(),
      description,
      width: width || 1600,
      height: height || 1000,
      theme: theme || 'modern-wood',
      obstacles: obstacles || [],
      zones: zones || [],
    });

    res.status(201).json({ success: true, office });
  } catch (error) {
    next(error);
  }
};

/**
 * Endpoint proving geospatial query support and latency (<20ms benchmark)
 */
export const benchmarkProximity = async (req, res, next) => {
  try {
    const count = parseInt(req.query.count) || 50;
    const benchmarkResult = proximityService.benchmarkInMomoryProximity(count);
    res.json({
      success: true,
      data: benchmarkResult,
      message: `Audited ${count} concurrent users in ${benchmarkResult.executionTimeMs.toFixed(2)}ms (Target: < 20ms)`,
    });
  } catch (error) {
    next(error);
  }
};

export const queryNearbyUsers = async (req, res, next) => {
  try {
    const { officeId, x, y, radius } = req.query;
    const coords = [parseFloat(x) || 0, parseFloat(y) || 0];
    const maxRadius = parseFloat(radius) || 100;

    const result = await proximityService.findNearbyUsersMongo(officeId, coords, maxRadius);
    res.json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
};
