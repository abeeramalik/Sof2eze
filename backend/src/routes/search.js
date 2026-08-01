import { Router } from "express";
import { searchQuerySchema } from "../utils/schemas.js";
import { searchCmsContent } from "../utils/cmsClient.js";

const router = Router();

router.get("/", async (req, res, next) => {
  try {
    const { q } = searchQuerySchema.parse(req.query);
    const results = await searchCmsContent(q);
    res.json({ query: q, results });
  } catch (err) {
    if (err.message === "CMS_UNAVAILABLE") {
      return res.status(503).json({
        error: "Search is temporarily unavailable. Please try again shortly.",
      });
    }
    next(err);
  }
});

export default router;
