// Minimal generated server entrypoint for Convex functions.
// Convex's runtime uses these generic wrappers; function references are
// resolved through anyApi from convex/server.
import { anyApi, queryGeneric, mutationGeneric, actionGeneric, httpActionGeneric } from "convex/server";

export const query = queryGeneric;
export const mutation = mutationGeneric;
export const action = actionGeneric;
export const httpAction = httpActionGeneric;
export const api = anyApi;
export const internal = anyApi;
