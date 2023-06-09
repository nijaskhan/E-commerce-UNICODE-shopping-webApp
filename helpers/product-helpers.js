const db = require('../config/connection');
const collection = require('../config/collections');
const objectId = require('mongodb-legacy').ObjectId;

module.exports={
    addProduct:(product,callback)=>{
        product.price = Number(product.price);
        product.discountPrice = Number(product.discountPrice);
        product.discountPerc = Number(product.discountPerc);
        product.listingStatus = true;
        product.category = objectId(product.category);
        db.get().collection(collection.PRODUCT_COLLECTION).insertOne(product).then((data)=>{
            callback(data.insertedId);
        })
    },
    addProductImages:(proId, imgUrls)=>{
        db.get().collection(collection.PRODUCT_COLLECTION).updateOne({_id:objectId(proId)},
        {$set:{
            images:imgUrls
        }});
    },
    getAllProducts:()=>{
        return new Promise(async(resolve,reject)=>{
            let products = await db.get().collection(collection.PRODUCT_COLLECTION).find().toArray();
            resolve(products);
        })
    },
    getAllProductsAdminSide:(currentPage)=>{
        return new Promise(async(resolve,reject)=>{
            currentPage = parseInt(currentPage);
            const limit=10;
            const skip = (currentPage-1)*limit;
            let products2 = await db.get().collection(collection.PRODUCT_COLLECTION).find().skip(skip).limit(limit).toArray();
            let products = [];
            for(let i=0;i<products2.length;i++){
                if(products2[i].listingStatus){
                    products.push(products2[i])
                }
            }
            resolve(products);
        })
    },
    listProduct:(proId)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.PRODUCT_COLLECTION).updateOne({_id:objectId(proId)},{$set:{
                listingStatus: true
            }}).then((response)=>{
                resolve(response);
            })
        })
    },
    unListProduct:(proId)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.PRODUCT_COLLECTION).updateOne({_id:objectId(proId)},{$set:{
                listingStatus: false
            }}).then((response)=>{
                resolve(response);
            })
        })
    },
    getProductDetails:(proId)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.PRODUCT_COLLECTION).findOne({_id:objectId(proId)}).then((product)=>{
                resolve(product);
            })
        })
    },
    updateProduct:(proId,proDetails)=>{
        return new Promise((resolve,reject)=>{
            proDetails.price = Number(proDetails.price);
            proDetails.discountPrice = Number(proDetails.discountPrice);
            proDetails.discountPerc = Number(proDetails.discountPerc);
            proDetails.stocks = Number(proDetails.stocks);
            db.get().collection(collection.PRODUCT_COLLECTION).updateOne({_id:objectId(proId)},
            {$set:{
                brand: proDetails.brand,
                name: proDetails.name, 
                description: proDetails.description,
                lgdescription : proDetails.lgdescription,
                price: proDetails.price,
                discountPrice: proDetails.discountPrice,
                discountPerc: proDetails.discountPerc,
                size: proDetails.size,
                stocks: proDetails.stocks,
                category: objectId(proDetails.category)
            }}).then((response)=>{
                resolve(response);
            })
        });
    },
    reduceStock:(proDet)=>{
        return new Promise(async(resolve, reject)=>{
            try{
                for(let i=0;i<proDet.length;i++){
                    await db.get().collection(collection.PRODUCT_COLLECTION)
                    .updateOne(
                        {
                            _id : proDet[i].productId
                        },
                        {
                            $inc:{
                                "stocks" : -proDet[i].quantity
                            }
                        }
                    )
                }
                resolve();
            }
            catch{
                resolve();
            }
        });
    },
    filterPrice:(minPrice, maxPrice, searchValue)=>{
        return new Promise(async(resolve, reject)=>{
            try{
                const products = await db.get().collection(collection.PRODUCT_COLLECTION)
                .find({
                    $and: [
                        { discountPrice: {$gte: parseInt(minPrice)}},
                        { discountPrice: {$lte: parseInt(maxPrice)}}
                    ],
                    $or: [
                        { brand: {$regex: searchValue, $options:"i" }},
                        { name: {$regex: searchValue, $options: "i"}}
                    ]
                }).toArray();
                resolve(products);
            }catch{
                resolve(null);
            }
        })
    },
    sortPrice:(details)=>{
        return new Promise(async(resolve, reject)=>{
            try{
                const minPrice = Number(details.minPrice);
                const maxPrice = Number(details.maxPrice);
                const value = details.sort;
                const searchValue = details.search;
                const products = await db.get().collection(collection.PRODUCT_COLLECTION)
                .find({
                    $and: [
                        { discountPrice: {$gte: minPrice}},
                        { discountPrice: {$lte: maxPrice}}
                    ],
                    $or: [
                        { brand: {$regex: searchValue, $options:"i" }},
                        { name: {$regex: searchValue, $options: "i"}}
                    ]
                }).sort({discountPrice: value}).toArray();
                resolve(products);
            }catch{
                resolve(null);
            }
        });
    },
    searchProducts:(details)=>{
        return new Promise(async(resolve, reject)=>{
            try{
                const minPrice = Number(details.minPrice);
                const maxPrice = Number(details.maxPrice);
                const searchValue = details.search;
                const products = await db.get().collection(collection.PRODUCT_COLLECTION)
                .find({
                    $and: [
                        { discountPrice: {$gte: minPrice}},
                        { discountPrice: {$lte: maxPrice}}
                    ],
                    $or: [
                        { brand: {$regex: searchValue, $options:"i" }},
                        { name: {$regex: searchValue, $options: "i"}}
                    ]
                }).toArray();
                resolve(products);
            }catch{
                resolve(null);
            }
        });
    },
    totalPages:()=>{
        return new Promise(async(resolve, reject)=>{
            const totalCount = await db.get().collection(collection.PRODUCT_COLLECTION).countDocuments({});
            resolve(totalCount);
        })
    },
    getRelatedProducts:()=>{
        return new Promise(async(resolve, reject)=>{
            try{
                const relatedProducts = await db.get().collection(collection.PRODUCT_COLLECTION).find().limit(3).toArray();
                console.log(relatedProducts);
                resolve(relatedProducts);
            }catch{
                resolve(null);
            }
        })
    },
    totalOrdersPlaced:()=>{
        return new Promise(async(resolve, reject)=>{
            try{
                const ordersPlacedCount = await db.get().collection(collection.ORDER_COLLECTION).countDocuments();
                resolve(ordersPlacedCount);
            }catch{
                resolve(0);
            }
        })
    }
}