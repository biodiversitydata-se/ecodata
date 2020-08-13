package au.org.ala.ecodata

import org.bson.types.ObjectId

/* Class for all participants in the project - they can be:
- users - registered in CAS 
- persons - not registered online but submitting their observations to 
    be entered by users
Exists to be able to hold contact details and display summaries of activity
of non-registered members to the admins
*/
class Person {

    ObjectId id
    // personId assigned to every person
    String personId
    // personCode assigned to SFT persons
    String personCode
    String firstName
    String lastName
    String email 
    String gender
    String birthDate
    String phoneNum
    String mobileNum
    String address1
    String address2
    String postCode
    String town
    String extra
    String modTyp
    String eProt
    // userId is for registered users only
    String userId
    // List bookedSites 
    // List pastSites
    List projects

    static constraints = {

        email nullable: true
        gender nullable: true
        birthDate nullable: true
        phoneNum nullable: true
        mobileNum nullable: true
        address1 nullable: true
        address2 nullable: true
        postCode nullable: true
        town nullable: true
        extra nullable: true, maxSize: 4000
        modTyp nullable: true
        eProt nullable: true
        userId nullable: true
        // bookedSites nullable: true
        // pastSites nullable: true
        projects nullable: true

    }
}
