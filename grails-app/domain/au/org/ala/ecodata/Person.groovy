package au.org.ala.ecodata

import org.bson.types.ObjectId

/**
* For systematic monitoring - volunteer management 
*
* Class for all members of a project - they can be:
* - users - registered in CAS 
* - persons - not registered online but submitting their observations to 
*    be entered by users
* Exists to be able to hold contact details and display to the project admins 
* summaries of activity of non-registered members
*/
class Person {

    ObjectId id
    // personId assigned automatically to every person
    String personId
    // internalPersonId assigned to SFT persons - DOB
    String internalPersonId
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
    // userId is for registered users only, same as in CAS system
    String userId
    List projects
    List bookedSites
    List ownedSites
    Date dateCreated
    Date lastUpdated 

    static constraints = {
        firstName nullable: false
        lastName nullable: false
        internalPersonId nullable: false, unique: true
        email nullable: false
        gender nullable: true
        birthDate nullable: true
        phoneNum nullable: true
        mobileNum nullable: true
        address1 nullable: false
        address2 nullable: true
        postCode nullable: false
        town nullable: false
        extra nullable: true, maxSize: 4000
        userId nullable: true
        bookedSites nullable: true
        projects nullable: false
        ownedSites nullable: true
    }
}
