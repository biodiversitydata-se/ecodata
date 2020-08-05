package au.org.ala.ecodata

import org.bson.types.ObjectId

class Person {

    ObjectId id
    String personId
    // String personCode substituted by personId to fit biocollect nomenclature
    String firstName
    String lastName
    String gender
    Integer birthYear
    String phoneNum
    String mobileNum
    String address1
    String address2
    String postCode
    String town
    String email 
    String extra
    String modTyp
    String eProt
    String registeredOnline = false
    List currentSites 
    List surveyedSites
    List projects

    static constraints = {

        gender nullable: true
        birthYear nullable: true
        phoneNum nullable: true
        mobileNum nullable: true
        address1 nullable: true
        address2 nullable: true
        postCode nullable: true
        town nullable: true
        email nullable: true
        extra nullable: true, maxSize: 4000
        modTyp nullable: true
        eProt nullable: true
        registeredOnline nullable: true
        currentSites nullable: true
        surveyedSites nullable: true
        projects nullable: false

    }
}
