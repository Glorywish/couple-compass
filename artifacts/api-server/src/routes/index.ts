import { Router, type IRouter } from "express";
import healthRouter from "./health";
import questionsRouter from "./questions";
import sessionsRouter from "./sessions";
import responsesRouter from "./responses";
import reportsRouter from "./reports";
import emailReportRouter from "./email-report";
import adminRouter from "./admin";

const router: IRouter = Router();

router.use(healthRouter);
router.use(questionsRouter);
router.use(sessionsRouter);
router.use(responsesRouter);
router.use(reportsRouter);
router.use(emailReportRouter);
router.use(adminRouter);

export default router;
