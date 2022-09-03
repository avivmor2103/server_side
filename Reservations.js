const { StatusCodes} = require("http-status-codes");


class Reservation{
    reservationId;
    numTable;
    reservationDate;
    reservationHour;
    numGuests;
    firstName;
    lastName;
    phoneNumber;
    clientEmail;
    createReservationDate;
    createReservationTime;

    constructor(reservationId, numTable, reservationDate, reservationHour, numGuests, firstName, lastName,phoneNumber,clientEmail, createReservationDate, createReservationTime){
        this.reservationId = reservationId;
        this.numTable = numTable;
        this.reservationDate = reservationDate;
        this.reservationHour = reservationHour; 
        this.numGuests = numGuests;
        this.firstName = firstName;
        this.lastName = lastName;
        this.phoneNumber = phoneNumber;
        this.clientEmail = clientEmail;
        this.createReservationDate =createReservationDate;
        this. createReservationTime = createReservationTime;
    }
}

const createNewReservation = async (req, res, client) => {
    const db = client.db("Management_system");
    const reservations = db.collection("Reservations");
    const numTable = req.body.numTable ;
    const reservationDate = req.body.date;
    const reservationHour = req.body.hour;
    const numGuests = req.body.numGuests;
    const firstName = req.body.firstName;
    const lastName = req.body.lastName;
    const phoneNumber = req.body.lastName;
    const clientEmail = req.body.email;

    /// create date
    let createReservationDate = new Date();
    let date = ("0" + createReservationDate.getDate()).slice(-2);
    let month = ("0" + (createReservationDate.getMonth() + 1)).slice(-2);
    let year = createReservationDate.getFullYear();
    let exectDate = (year + "-" + month + "-" + date);
    let hours = createReservationDate.getHours();
    let minutes = createReservationDate.getMinutes();
    let seconds = createReservationDate.getSeconds();
    let exectTime = (hours + ":" + minutes + ":" + seconds);

    let reservationId;
    let resArray = [];
    try{
        resArray = await reservations.find().toArray();
        if(resArray.length === 0)
        {
            reservationId = 1;
        }else{
            reservationId = 1;
            resArray.forEach(element => {
                if(element.reservationId >= reservationId){
                    reservationId = element.reservationId + 1;
                }
            });
        }
    }catch(e){
        console.log(e);
    }

    

    // create reservation obj
    const newReservation = new Reservation(
                                           reservationId,
                                           numTable,
                                           reservationDate,
                                           reservationHour,
                                           numGuests,
                                           firstName,
                                           lastName,
                                           phoneNumber,
                                           clientEmail,
                                           exectDate,
                                           exectTime 
                                        );
    
    let reserve;
    try{
        await reservations.insertOne(newReservation);
        reserve = await reservations.findOne({ reservationId : parseInt(reservationId)})
    }catch(e){
        console.log(e);
    }

    res.status(StatusCodes.CREATED);
    res.send(newReservation);
}

const deleteReservation = async( req, res , client) => {
    const db = client.db("Management_system");
    const reservations = db.collection("Reservations");
    console.log(req);
    const numReservationToDelete = parseInt(req.params.reservationId);

    let reservationsArray = [];
    try{
        await reservations.deleteOne({reservationId : numReservationToDelete});
        reservationsArray = await reservations.find().toArray();
       
    }catch(e){
        console.log(e);
    }
    res.status(StatusCodes.OK);
    res.send(reservationsArray);
}

const updateReservationDate = async (req, res, client) => {
    const db = client.db("Management_system");
    const reservations = db.collection("Reservations");
    const newHourReservation = req.body.newHour;
    const newDateReservation = req.body.newDate;
    const id = req.body.reservationId;

    let reservationsArray = [];
    try{
        await reservations.updateOne({ reservationId : parseInt(id)} ,{ $set : {reservationHour : newHourReservation}});
        await reservations.updateOne({ reservationId : parseInt(id)} , {$set: {reservationDate : newDateReservation}});
        reservationsArray = await reservations.find().toArray();
    }catch(e){
        console.log(e);
        res.status(StatusCodes.NOT_FOUND);
        res.send("No such reservation found");
    }
    res.status(StatusCodes.OK);
    res.send(reservationsArray);
}

const getReservation = async (req, res, client) => {
    const db = client.db("Management_system");
    const reservations = db.collection("Reservations");
    const id = req.params.reservationId;

    let reservation ;
    try{
        reservation = await reservations.findOne({reservationId : parseInt(id)});
    }catch(e){
        console.log(e);
        res.status(StatusCodes.NOT_FOUND);
        res.send("No such reservation found");
    }
    res.status(StatusCodes.OK);
    res.send(reservation);
}

const updateReservationClientDetailes = async (req, res, client) => {
    const db = client.db("Management_system");
    const reservations = db.collection("Reservations");
    const numGuests = req.body.numGuests;
    const firstName = req.body.firstName;
    const lastName = req.body.lastName;
    const phoneNumber = req.body.phoneNumber;
    const email = req.body.email;
    const id = req.body.reservationId;

    let reservationsArray = [];
    try{
        if(numGuests){
            await reservations.updateOne({ reservationId : parseInt(id)} , {$set: {numGuests : numGuests}});
        }
        if(firstName){
            await reservations.updateOne({ reservationId : parseInt(id)} , {$set: {firstName : firstName}});
        }
        if(lastName){
            await reservations.updateOne({ reservationId : parseInt(id)} , {$set: {lastName : lastName}});
        }
        if(phoneNumber){
            await reservations.updateOne({ reservationId : parseInt(id)} , {$set: {phoneNumber : phoneNumber}});
        }
        if(numGuests){
            await reservations.updateOne({ reservationId : parseInt(id)} , {$set: {clientEmail : email}});
        }
        reservationsArray = await reservations.fond().toArray();
    }catch(e){
        console.log(e);
        res.status(StatusCodes.NOT_FOUND);
        res.send("Error updating reservation");
    }

    res.status(StatusCodes.OK);
    res.send(reservationsArray);
}

const getAllReservation = async (req, res ,client) =>{
    const db = client.db("Management_system");
    const reservations = db.collection("Reservations");
    
    let reservationsArray = [];
    try{
        reservationsArray =  await reservations.find().toArray();
    }catch(e){
        console.log(e);
        res.status(StatusCodes.NOT_FOUND);
        res.send("Error getting reservation");
    }
    res.status(StatusCodes.OK);
    res.send(reservationsArray);
}

module.exports = {
    createNewReservation : createNewReservation,
    deleteReservation : deleteReservation,
    updateReservationDate : updateReservationDate,
    getReservation : getReservation,
    updateReservationClientDetailes : updateReservationClientDetailes,
    getAllReservation :getAllReservation
}