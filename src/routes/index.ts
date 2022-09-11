import express from "express";
import { previousSales } from "../controllers";

export const router = express.Router();
router.route("/sales").get(previousSales);
