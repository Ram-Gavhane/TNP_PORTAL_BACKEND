import type { Request, Response } from "express";
import db from "../../client.js";

export const getStatistics = async (req: Request, res: Response) => {
    try {
        const statistics: any = await db.$queryRaw`
        SELECT 
            COUNT(*) as "totalStudents",
            (SELECT COUNT(*) FROM "JobPost") as "totalPostings",
            (SELECT COUNT(DISTINCT "studentId") FROM "Application" WHERE "status" = 'SELECTED') as "placedStudents"
        FROM "StudentProfile"`

        // Convert BigInt to Number for JSON serialization
        const serializedStatistics = statistics.map((stat: any) => {
            const newStat: any = {};
            for (const key in stat) {
                newStat[key] = typeof stat[key] === "bigint" ? Number(stat[key]) : stat[key];
            }
            // The query returns an array with one object because of how the SQL is structured
            return newStat;
        })[0];

        return res.status(200).json({ statistics: serializedStatistics });
    } catch (error) {
        console.error("Error getting statistics:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
};