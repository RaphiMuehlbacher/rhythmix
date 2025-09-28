import {query} from "./_generated/server";
import {getAuthUserId} from "@convex-dev/auth/server";
import type {Id} from "./_generated/dataModel";

export type User = {
	_id: Id<"users">
	_creationTime: number
	name?: string,
	image?: string,
	email?: string,
}

export const currentUser = query({
	args: {},
	handler: async (ctx) => {
		const userId = await getAuthUserId(ctx);
		if (userId === null) {
			return null;
		}
		return await ctx.db.get(userId);
	},
});