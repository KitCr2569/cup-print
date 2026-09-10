export function getClientIp(request: Request) { return request.headers.get("x-vercel-forwarded-for")?.split(",")[0]?.trim() || request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown"; }
export function hasSameOrigin(request: Request) { const origin=request.headers.get("origin"); if(!origin)return true; try{return new URL(origin).host===new URL(request.url).host}catch{return false} }
export function rateLimitedResponse(seconds:number){return Response.json({error:"??????????????"},{status:429,headers:{"retry-after":String(seconds)}})}
