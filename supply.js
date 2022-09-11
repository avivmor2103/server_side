const { StatusCodes} = require("http-status-codes");

class Supplier {
    supplierName;
    supplierEmail;
    phoneNumber;
    address;
    supplierCategory;

    constructor(name , email, phone, address, category){
        this.supplierName =  name;
        this.supplierEmail = email;
        this.phoneNumber = phone;
        this.address = address;
        this.supplierCategory = category;
    }
}

const addNewSupplier = async (req, res, client)=>{ 
    const db = client.db("Management_system");
    const suppliers = db.collection("Suppliers");

    const name = req.body.name;
    const email = req.body.email;
    const phone = parseInt(req.body.phoneNumber);
    const address = req.body.address;
    const category = req.body.category;


    const newSupplier = new Supplier(name , email, phone, address, category);
    let allSuppliers = [] 
    try{
        await suppliers.insertOne(newSupplier);
        allSuppliers = await suppliers.find().toArray();
    }catch(e){
        console.log(e);
    }
    res.status(StatusCodes.CREATED);
    res.send(JSON.stringify(allSuppliers));
}


const deleteSupplier = async (req, res, client) => {
    const db = client.db("Management_system");
    const suppliers = db.collection("Suppliers");

    const supplierName = req.body.name;
    let allSuppliers = [];
    try{
        await suppliers.deleteOne({ supplierName : supplierName });
        allSuppliers = await suppliers.find().toArray();
    }catch(e){
        console.log(e);
    }
    res.status(StatusCodes.OK);
    res.send(allSuppliers);
}

const updateSupplierData = async (req, res, client)=>{ 
    const db = client.db("Management_system");
    const suppliers = db.collection("Suppliers");

    const supplierName = req.body.name;
    const supplierEmail = req.body.email;
    const phoneNumber = req.body.phone;
    const address = req.body.address;
    const supplierCategory = req.body.category;
    try{
        if(supplierEmail){
            await suppliers.updateOne({ supplierName: supplierName}, {$set :{supplierEmail: supplierEmail}}) 
        }
    
        if(phoneNumber){
            await suppliers.updateOne({ supplierName: supplierName}, {$set :{phoneNumber: phoneNumber}}) 
        }
    
        if(address){
            await suppliers.updateOne({ supplierName: supplierName}, {$set :{address: address}}) 
        }
    
        if(supplierCategory){
            await suppliers.updateOne({ supplierName: supplierName}, {$set :{supplierCategory: supplierCategory}}) 
        }
    
    }catch(e){
        console.log(e)
    }
    
    let allSuppliers = [];
    try{
        allSuppliers = await suppliers.find().toArray();
    }catch(e){
        console.log(e);
    }

    res.status(StatusCodes.OK);
    res.send(JSON.stringify(allSuppliers));
}

const getAllSupplier = async (req, res, client)=>{
    const db = client.db("Management_system");
    const suppliers = db.collection("Suppliers");
    try{
        const allSuppliers = await suppliers.find().toArray();
        res.status(StatusCodes.OK);
        res.send(allSuppliers);
    }catch(e){
        console.log(e);
    }
}

module.exports = {
    addNewSupplier: addNewSupplier,
    deleteSupplier: deleteSupplier,
    updateSupplierData: updateSupplierData,
    getAllSupplier: getAllSupplier

}