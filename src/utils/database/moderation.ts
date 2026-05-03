import { Satisfies } from "utils/types";
import { db, isSqlite, values } from ".";
import { TableDefinition, TypeOfDefinition } from "./types";

export type Case = Satisfies<
  TableDefinition,
  {
    name: "moderation";
    definition: {
      guild: "TEXT";
      userID: "TEXT";
      type: "TEXT";
      moderator: "TEXT";
      reason: "TEXT";
      id: "INTEGER";
      timestamp: "TIMESTAMP";
      expiresAt: "TIMESTAMP";
    };
  }
>;

export type ModType = "MUTE" | "UNMUTE" | "WARN" | "KICK" | "BAN" | "UNBAN";

export async function createCase(
  guildID: string | number,
  userID: string,
  modType: ModType,
  moderator: string,
  reason = "",
  expiresAt?: Date | null,
) {
  const id: number =
    (values(
      await db`SELECT id FROM moderation WHERE "guild" = ${guildID} ORDER BY "id" DESC LIMIT 1;`,
      true,
    )[0] ?? 0) + 1;

  const insObject = {
    guild: guildID,
    userID,
    type: modType,
    moderator,
    reason,
    id,
    timestamp: isSqlite ? new Date().toISOString() : new Date(),
    expiresAt: expiresAt ? (isSqlite ? expiresAt.toISOString() : expiresAt) : null,
  };
  await db`INSERT INTO moderation ${db(insObject)};`; // Rare conflict possible if two mods add a case at the approx same moment ?
  return id;
}

export async function listGuildCases(guildID: number | string, modType?: ModType) {
  const typeFilter = db`AND "type" = ${modType}`;
  const res = values(
    await db`
      SELECT * FROM moderation
      WHERE "guild" = ${guildID}
      ${modType ? typeFilter : db``}
      ORDER BY "id" DESC;`,
  ) as TypeOfDefinition<Case>[];

  if (isSqlite) res.forEach((r: any) => { r.timestamp = new Date(r.timestamp); if (r.expiresAt) r.expiresAt = new Date(r.expiresAt); });
  return res;
}

export async function listUserCases(
  guildID: number | string,
  userID: number | string,
  modType?: ModType,
) {
  const typeFilter = db`AND "type" = ${modType}`;
  const res = values(
    await db`
      SELECT * FROM moderation
      WHERE "guild" = ${guildID}
      AND "userID" = ${userID}
      ${modType ? typeFilter : db``}
      ORDER BY "id" DESC;`,
  ) as TypeOfDefinition<Case>[];

  if (isSqlite) res.forEach((r: any) => { r.timestamp = new Date(r.timestamp); if (r.expiresAt) r.expiresAt = new Date(r.expiresAt); });
  return res;
}

export async function getCase(guildID: number | string, id?: number) {
  const modCase = values(
    await db`SELECT * FROM moderation WHERE "guild" = ${guildID} AND "id" = ${id};`,
  ) as TypeOfDefinition<Case>[];

  if (isSqlite) modCase.forEach((r: any) => { r.timestamp = new Date(r.timestamp); if (r.expiresAt) r.expiresAt = new Date(r.expiresAt); });
  if (modCase.length) return modCase;
  return [];
}

export async function editCase(
  guildID: number | string,
  id: number,
  reason: string,
  expiresAt?: Date | null,
) {
  const exp = expiresAt ? (isSqlite ? expiresAt.toISOString() : expiresAt) : null;
  await db`UPDATE moderation SET reason = ${reason}, expiresAt = ${exp} WHERE "guild" = ${guildID} AND "id" = ${id};`;
}

export async function removeCase(guildID: string | number, id: number) {
  await db`DELETE FROM moderation WHERE "guild" = ${guildID} AND id = ${id};`;
}

export async function getPendingBans(currentTime: number) {
  const current = isSqlite ? new Date(currentTime).toISOString() : new Date(currentTime);
  const res = values(
    await db`SELECT * FROM moderation WHERE "type" = 'BAN' AND "expiresAt" IS NOT NULL AND "expiresAt" > ${current};`,
  ) as TypeOfDefinition<Case>[];

  if (isSqlite) res.forEach((r: any) => { r.timestamp = new Date(r.timestamp); if (r.expiresAt) r.expiresAt = new Date(r.expiresAt); });
  return res;
}
