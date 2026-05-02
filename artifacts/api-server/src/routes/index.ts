import { Router, type IRouter } from "express";
import healthRouter from "./health";
import questionsRouter from "./questions";
import sessionsRouter from "./sessions";
import responsesRouter from "./responses";
import reportsRouter from "./reports";

const router: IRouter = Router();

router.use(healthRouter);
router.use(questionsRouter);
router.use(sessionsRouter);
router.use(responsesRouter);
router.use(reportsRouter);

export default router;
