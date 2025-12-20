import express from 'express';
import CompsMapService from '../services/comps/compsMap.service';

const router = express.Router();
const compsMapService = new CompsMapService();

/**
 * @route POST /api/comps/map/clusters
 * @description Get geo-clustered properties for map display
 * @access Protected
 */
router.post('/clusters', compsMapService.getGeoClusters);

/**
 * @route POST /api/comps/map/cluster-details
 * @description Get detailed properties within a cluster/bounds
 * @access Protected
 */
router.post('/cluster-details', compsMapService.getClusterDetails);

/**
 * @route POST /api/comps/map/stats
 * @description Get map statistics for the current view
 * @access Protected
 */
router.post('/stats', compsMapService.getMapStats);

/**
 * @route POST /api/comps/map/search
 * @description Search properties within map bounds with enhanced features
 * @access Protected
 */
router.post('/search', compsMapService.searchMapProperties);

/**
 * @route GET /api/comps/map/filters
 * @description Get available filter options for map search
 * @access Protected
 */
router.get('/filters', compsMapService.getMapFilters);

export default router;
