import z from "zod";

export const importSchema=z.object({
    url:z.string().url()
})

export const bulkSchema=z.object({
    url:z.string().url(),
    search: z.string().trim()
})


export const extractSchema=z.object({
    author:z.string().nullable(),
    publishedAt:z.string().nullable()
})