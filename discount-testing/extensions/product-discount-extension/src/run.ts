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

let DISCOUNT_AMOUNT = (50/100)*100; /* 10% discount = (10/100) */
export function run(input: RunInput): FunctionRunResult {
  // const customerIdentity=input.cart.buyerIdentity?.email;
  // if(!customerIdentity?.includes("levi.in")){
  //   return EMPTY_DISCOUNT;
  // }
  let fixedDiscountToGive=0;
  let discountedCompareAtPrice=0;
  const customerIdentity=input.cart.buyerIdentity?.email;
  if(!customerIdentity?.includes("levi.in")) return EMPTY_DISCOUNT;
  const targets: Target[] = input.cart.lines
  // .filter(line => {
  //   let itemCompareAtAmountPerQuantity = line.cost.compareAtAmountPerQuantity?.amount || line.cost.amountPerQuantity.amount; //300
  //   let disc=itemCompareAtAmountPerQuantity/2;
  //   let itemAmountPerQuantity = line.cost.amountPerQuantity.amount; //200
  //   if(!itemAmountPerQuantity){
  //     itemAmountPerQuantity=itemCompareAtAmountPerQuantity;
  //   }
  //   // find the discounted price of the product
  //    discountedCompareAtPrice = (disc/itemAmountPerQuantity)*100;
  //   return true;
  // })
  .filter(line=>{
    let itemCompareAtAmountPerQuantity = line.cost.compareAtAmountPerQuantity?.amount;
    if(itemCompareAtAmountPerQuantity){
      let cutoffAmount=itemCompareAtAmountPerQuantity/2;
      return cutoffAmount<line.cost.amountPerQuantity.amount;
    }
  })
  .map(line => {
    let itemCompareAtAmountPerQuantity = line.cost.compareAtAmountPerQuantity?.amount || line.cost.amountPerQuantity.amount;
    if(line.cost.compareAtAmountPerQuantity?.amount==0){
      fixedDiscountToGive += (line.cost.amountPerQuantity.amount/2);
    }else{
      fixedDiscountToGive+=line.cost.compareAtAmountPerQuantity?.amount/2;
    }
    
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
        message: "50% OFF"
      }
    ]
  }
  return DISCOUNTED_ITEMS;
};
// import type {
//   RunInput,
//   FunctionRunResult,
//   Target,
//   ProductVariant
// } from "../generated/api";
// import {
//   DiscountApplicationStrategy,
// } from "../generated/api";

// const EMPTY_DISCOUNT: FunctionRunResult = {
//   discountApplicationStrategy: DiscountApplicationStrategy.First,
//   discounts: [],
// };

// let DISCOUNT_AMOUNT = (40/100); /* 10% discount = (10/100) */
// export function run(input: RunInput): FunctionRunResult {
//   // const customerIdentity=input.cart.buyerIdentity?.email;
//   // if(!customerIdentity?.includes("levi.in")){
//   //   return EMPTY_DISCOUNT;
//   // }
//   let fixedDiscountToGive=0;
//   const customerIdentity=input.cart.buyerIdentity?.email;
//   if(!customerIdentity?.includes("levi.in")) return EMPTY_DISCOUNT;
//   const targets: Target[] = input.cart.lines
//   .filter(line => {
//     let itemCompareAtAmountPerQuantity = line.cost.compareAtAmountPerQuantity?.amount || line.cost.amountPerQuantity.amount; //300
//     let itemAmountPerQuantity = line.cost.amountPerQuantity.amount; //200
//     // find the discounted price of the product
//     let discountedCompareAtPrice = itemCompareAtAmountPerQuantity - (DISCOUNT_AMOUNT * itemCompareAtAmountPerQuantity);
//     return (!(itemAmountPerQuantity < discountedCompareAtPrice)) && line.merchandise.__typename == "ProductVariant"
//   })
//   .map(line => {
//     let itemCompareAtAmountPerQuantity = line.cost.compareAtAmountPerQuantity?.amount || line.cost.amountPerQuantity.amount;
//     fixedDiscountToGive += (DISCOUNT_AMOUNT * itemCompareAtAmountPerQuantity * line.quantity);
    
//     return ({
//       // Use the variant ID to create a discount target
//       productVariant: {
//         id: (line.merchandise as ProductVariant).id,
//       }
//     });
//   });

//   const DISCOUNTED_ITEMS: FunctionRunResult = {
//     discountApplicationStrategy: DiscountApplicationStrategy.First,
//     discounts: [
//       {
//         targets: targets,
//         value: {
//           fixedAmount: {
//             amount: 20.00,
//             appliesToEachItem:false
//           }
//         },
//         message: "50% OFF"
//       }
//     ]
//   }
//   return DISCOUNTED_ITEMS;
// };