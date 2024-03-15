class client {
    constructor (firstname,lastname,companyname,email,phone,servicetype = null,servicedescription = null)
    {
        this.firstname = firstname,
        this.lastname = lastname,
        this.companyname = companyname,
        this.email = email,
        this.phone = phone
        this.servicetype = servicetype,
        this.servicedescription = servicedescription
    }
}
module.exports = client;