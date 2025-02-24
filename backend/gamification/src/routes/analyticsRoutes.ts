import { Router } from 'express';
import { AnalyticsController } from '../controllers/AnalyticsController';

const router = Router();
const controller = new AnalyticsController();

// Event tracking
router.post('/events', controller.trackEvent);

// User analytics
router.get('/user/:userId', controller.getUserAnalytics);
router.get('/user/:userId/engagement', controller.getUserEngagementMetrics);

// Event analytics
router.get('/events/:event', controller.getEventAnalytics);

// Metrics and summaries
router.get('/metrics/summary', controller.getMetricsSummary);
router.get('/metrics/aggregated', controller.getAggregatedMetrics);
router.get('/metrics/system', controller.getSystemMetrics);

export default router; 