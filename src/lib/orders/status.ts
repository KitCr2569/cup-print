export const ORDER_STATUSES=["PENDING_PAYMENT","PAID","DESIGN_APPROVED","PRINTING","PRINTED","PACKING","SHIPPED","COMPLETED","CANCELLED"] as const;export type OrderStatus=typeof ORDER_STATUSES[number];
const transitions:Record<OrderStatus,OrderStatus[]>={PENDING_PAYMENT:["PAID","CANCELLED"],PAID:["DESIGN_APPROVED","CANCELLED"],DESIGN_APPROVED:["PRINTING","CANCELLED"],PRINTING:["PRINTED"],PRINTED:["PACKING"],PACKING:["SHIPPED"],SHIPPED:["COMPLETED"],COMPLETED:[],CANCELLED:[]};
export function isOrderStatus(value:unknown):value is OrderStatus{return typeof value==="string"&&ORDER_STATUSES.includes(value as OrderStatus)}
export function canTransitionOrder(from:OrderStatus,to:OrderStatus){return from===to||transitions[from].includes(to)}
