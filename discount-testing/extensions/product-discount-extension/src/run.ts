import type {
  RunInput,
  FunctionRunResult,
  Target,
  ProductVariant
} from "../generated/api";
import {
  DiscountApplicationStrategy,
} from "../generated/api";

const EMPTY_DISCOUNT: FunctionRunResult = {
  discountApplicationStrategy: DiscountApplicationStrategy.First,
  discounts: [],
};

let DISCOUNT_AMOUNT = (50/100); /* 10% discount = (10/100) */
export function run(input: RunInput): FunctionRunResult {
  let fixedDiscountToGive=0;
  const customerIdentity=input.cart.buyerIdentity?.email;
  if(!customerIdentity?.includes("levi.com")) return EMPTY_DISCOUNT;
  const targets: Target[] = input.cart.lines
  .filter(line=>{
    let itemCompareAtAmountPerQuantity = line.cost.compareAtAmountPerQuantity?.amount;
    if(itemCompareAtAmountPerQuantity){
      let cutoffAmount=itemCompareAtAmountPerQuantity/2;
      return cutoffAmount<line.cost.amountPerQuantity.amount;
    }
  })
  .map(line => {
    let itemCompareAtAmountPerQuantity = line.cost.compareAtAmountPerQuantity?.amount || line.cost.amountPerQuantity.amount;
    let itemAmountPerQuantity = line.cost.amountPerQuantity.amount;
    let orignalDiscount = itemCompareAtAmountPerQuantity - itemAmountPerQuantity;
    fixedDiscountToGive += (((DISCOUNT_AMOUNT * itemCompareAtAmountPerQuantity) - orignalDiscount) * line.quantity);
    return ({
      // Use the variant ID to create a discount target
      productVariant: {
        id: (line.merchandise as ProductVariant).id,
      }
    });
  });

  const DISCOUNTED_ITEMS: FunctionRunResult = {
    discountApplicationStrategy: DiscountApplicationStrategy.First,
    discounts: [
      {
        targets: targets,
        value: {
          fixedAmount: {
            amount: fixedDiscountToGive,
          }
        },
        message: "Additional Employee Discount"
      }
    ]
  }
  return DISCOUNTED_ITEMS;
};
