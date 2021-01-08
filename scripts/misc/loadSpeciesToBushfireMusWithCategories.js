load("uuid.js");

function createBushFireManagementUnit(states){
    var now = ISODate();
    for (var i=0; i<states.length; i++) {
        var state = states[i];

        var mu = {
            name:state.name,
            managementUnitId:UUID.generate(),
            dateCreated:now,
            dateUpdated:now,
            config:{},
            priorities: [],
            status:'active'
        };

        var existingMU = db.managementUnit.find({name:states[i].name});
        if (!existingMU.hasNext()) {
            db.managementUnit.insert(mu);
            print(mu.name+" "+mu.managementUnitId);
        }
    }
}

function updateSpecies (ts, mgUnit, category){
    var management = db.managementUnit.find({name: mgUnit});
    while (management.hasNext()) {
        var m = management.next();
        ts.forEach(function (species) {
            var isPrioritiesExist = false;
            for (i = 0; i < m.priorities.length; i++) {
                if (m.priorities[i].category === category && m.priorities[i].priority === species) {
                    isPrioritiesExist = true
                }
            }
            if (!isPrioritiesExist) {
                m.priorities.push({category: category, priority: species});
                print("Saving this " + species + " to the mangement unit: " + m.name + " under this category: " + category)
                db.managementUnit.save(m);
            }

        });
    }

}

function removePrioritiesIfpresent(options){
    var {mgUnit, management, category} = options
    mgUnit.priorities.forEach(function(priorities){
        if (priorities.category === category){
            print("Removing Existing other species")
            print("ManagementUnit: " + management + " Category: " + priorities.category  + " species: " + priorities.priority)
            db.managementUnit.update({managementUnitId: mgUnit.managementUnitId},{"$pull": { "priorities": {"category":category}}},{"multi": true});
        }
    });

}

function addTsToMus(managementUnit, ts, category) {
    if (!category) {
        category = 'Threatened Species';
    }
    managementUnit.forEach(function (management) {
        var muExist = db.managementUnit.find({name: management});
        while (muExist.hasNext()) {
            var mgUnit = muExist.next();
            if (mgUnit.priorities.length > 0){
                var options = {mgUnit, management, category}
                removePrioritiesIfpresent(options);
            }
            print("Adding species after removing species from the priorities list")
           updateSpecies(ts, management, category)
        }
    });
}
let states = [
    {
        name: "Alpine Bushfires"
    },
    {
        name: "Greater Blue Mountains Bushfires"

    },
    {
        name: "East Gippsland Bushfires"
    },
    {
        name: "Kangaroo Island Bushfires"
    },
    {
        name: "NSW North Coast And Tablelands Bushfires"
    },
    {
        name: "NSW South Coast Bushfires"
    },
    {
        name: "South-East Queensland Bushfires"
    }
]
createBushFireManagementUnit(states)
let alpineTEC = [
    "Alpine Sphagnum Bogs and Associated Fens",
    "Ecological vegetation classes (EVC) dominated by fire sensitive eucalypt species",
    "Ecological vegetation classes dominated by callitris pine",
    "Montane Peatlands and Swamps of the New England Tableland, NSW North Coast, Sydney Basin, South East Corner, South Eastern Highlands and Australian Alps bioregions",
    "Podocarpus heathland",
    "Kosciuszko-Namadgi Alpine Ash Moist Grassy Forest",
    "Jounama Snow Gum Shrub Woodland",
    "Alpine Snow Gum Woodland",
    "Black Sallee Woodland",
    "White Box-Yellow Box-Blakely's Red Gum Grassy Woodland and Derived Native Grassland",
    "Natural Temperate Grassland of the South Eastern Highlands",
    "Alpine Teatree shrubland",
    "Kosciuszko Flanks Moist Gully Forest",
    "Kosciuszko Snow Gum-Mountain Gum Moist Forest",
    "Kosciuszko-Namadgi Alpine Ash Moist Grassy Forest",
    "Jounama Snow Gum Shrub Woodland",
    "Kosciuszko Western Flanks Moist Shrub Forest",
    "Kosciuszko Eastern Slopes Mountain Gum Forest",
    "Namadgi Subalpine Rocky Shrubland",
    "Kybeyan Montane Heath",
    "Eucalyptus niphophila woodlands (Alpine Snow Gum Woodland)"
];
let alpineVertebrateAnimals = [
    "Burramys parvus (Mountain Pygmy-possum)",
    "(Alpine She-oak Skink)",
    "(Northern Corroboree Frog)",
    "(Southern Corroboree Frog)",
    "(Spotted Tree Frog)",
    "Potorous longipes (Long-footed Potoroo)",
    "Antechinus mimetes (Dusky Antechinus)",
    "Ornithorhynchus anatinus (Platypus)",
    "Phascolarctos cinereus (Koala)",
    "Potorous tridactylus (Long-nosed Potoroo)",
    "Pseudomys novaehollandiae (New Holland Mouse, Pookila)",
    "Petrogale penicillata (Brush-tailed Rock-wallaby)",
    "Pteropus poliocephalus (Grey-headed Flying-fox)",
    "Menura novaehollandiae (Superb Lyrebird)",
    "Callocephalon fimbriatum (Gang-gang Cockatoo)",
    "Pycnoptilus floccosus (Pilotbird)",
    "Climacteris erythrops (Red-browed Treecreeper)",
    "Anthochaera phrygia (Regent Honeyeater)",
    "Monarcha melanopsis (Black-faced Monarch)",
    "Calyptorhynchs lathami (Glossy Black-Cockatoo (eastern))",
    "Galaxias rostratus (Flathead Galaxias, Beaked Minnow, Dargo Galaxias)",
    "Cyclodomorphs praealtus (Alpine She-oak Skink)",
    "Pseudemoia cryodroma (Alpine Bog Skink)",
    "Liopholis guthega (Guthega Skink)",
    "Pseudemoia rawlinsoni (Glossy Grass Skink, Swampland Cool-skink)",
    "Eulamprus typmanum (Southern Water-skink)",
    "Pseudophryne corroboree (Southern Corroboree Frog)",
    "Litoria spenceri (Spotted Tree Frog)",
    "Pseudophryne pengilleyi (Northern Corroboree Frog)"
];
let alpineAdditionalPrioritySpecies = [
    "Dasyurus maculatus (Spot-tailed Quoll)",
    "Mastacomys fuscus mordicus (Broad-toothed Rat)",
    "Miniopterus orianae oceanensis (Eastern Bentwing Bat)",
    "Petaurus australis (Yellow-bellied Glider)",
    "Petaurus norfolcensis (Squirrel Glider)",
    "Petauroides volans (Southern Greater Glider)",
    "Potorous longipes (Long-footed Potoroo)",
    "Pseudomys fumeus (Smoky Mouse)",
    "Crinia sloanei (Sloanes Froglet)",
    "Litoria booroolongensis (Booroolong Tree Frog)",
    "Litoria verreauxii alpina (Alpine Tree Frog)",
    "Macquaria australasica (Macquarie Perch)",
    "Galaxias tantangara (Stocky Galaxias)",
    "Gadopsis bispinosus (Two-spined Blackfish)",
    "Callocephalon fimbriatum (Gang gang Cockatoo)",
    "Climacteris picumnus victoriae (Brown Treecreeper)",
    "Melithreptus gularis (Black-chinned Honeyeater)",
    "Neophema pulchella (Turquoise Parrot)",
    "Ninox connivens (Barking Owl)",
    "Ninox strenua (Powerful Owl)",
    "Stagonopleura guttata (Diamond Firetail)"
];
let alpineInvertebrateSpecies = [
    "Xenica Oreixenica lathalis theddora (Alpine Silver)",
    "Hedleyropa yarrangobillyensis (Yarrangobilly Pinwheel Snail)",
    "Buburra jeanae (leaf beetle)",
    "Canthocamptus longipes (harpactacoid copepod)",
    "Euastacus crassus. (Alpine crayfish)",
    "Euastacus diversus (Orbost Spiny Crayfish)",
    "Euastacus rieki (Riek's Crayfish)",
    "Thaumatoperia alpina (Alpine Stonefly)",
    "Castiarina flavoviridis (jewel beetle)",
    "Austrochloritis kosciuszkoensis (Koscuiszko Bristle Snail)",
    "Austrorhytida glaciamans (Koscuiszko Carnivorous Snail)",
    "Diphyoropa illustra (Lakes Entrance Pinwheel Snail)",
    "Oreixenica latialis (Small Alpine Xenica)",
    "Austroaeschna flavomaculata (Alpine Darner)",
    "Paralaoma annabelli (Prickle Pinhead Snail)",
    "Oreixenica orichora (Spotted Alpine Xenica)",
    "Castiarina kershawi (jewel beetle)",
    "Oreixenica correae (Orange Alpine Xenica; Correa Brown)",
    "Aulacopris reichei (Beetle)",
    "Temognatha grandis (jewel beetle)",
    "Leptoperla cacuminis (Mount Kosciusko Wingless Stonefly)",
    "Asteron grayi (Spider, harvestman or pseudoscorpion)",
    "Molycria mammosa (Spider, harvestman or pseudoscorpion -)",
    "Storenosoma terraneum (Spider, harvestman or pseudoscorpion -)",
    "Acanthaeschna victoria (Thylacine Darner)",
    "Austropetalia patricia (Waterfall Redspot)"
];
let alpinePriorityPlants = [
    "Grevillea jephcottii (Pine Mountain Grevillea)",
    "Grevillea oxyantha subsp. ecarinata  ",
    "Olearia stenophylla  ",
    "Prasophyllum bagoense (Bago Leek-orchid)",
    "Eucalyptus forresterae (Brumby Sallee)",
    "Pomaderris helianthemifolia ",
    "Prasophyllum keltonii (Kelton’s Leek-orchid)",
    "Pterostylis oreophila (Blue-tongue Greenhood)",
    "Gentianella sylvicola ",
    "Pultenaea vrolandii ",
    "Zieria citriodora (Lemon-scented Zieria)",
    "Tetratheca subaphylla (Leafless Pinkbells)",
    "Cardamine tryssa (Dainty Bitter-cress)",
    "Prostanthera walteri (Blotchy Mintbush)",
    "Galium roddii ",
    "Dampiera fusca (Kydra Dampiera)",
    "Prostanthera stenophylla ",
    "Philotheca myoporoides subsp. brevipedunculata ",
    "Callistemon subulatus (Dwarf Bottlebrush)",
    "Dillwynia brunioides ",
    "Eucalyptus fraxinoides (White Mountain Ash, White Ash)",
    "Eucalyptus elaeophloia (Nunniong Gum)",
    "Grevillea macleayana (Jervis Bay Grevillea)",
    "Deyeuxia talariata"
];
let alpineAdditionalPlants = [
    "Acacia blayana (Blay’s Wattle)",
    "Acacia covenyi ",
    "Acacia mabellae ",
    "Acacia phlebophylla (Mount Buffalo Wattle)",
    "Acacia phasmoides (Phantom Wattle)",
    "Acacia saliciformis ",
    "Acacia trachyphloia ",
    "Almalea capitata (Slender Parrot Pea)",
    "Banksia canei (Mountain Banksia)",
    "Botrychium lunaria (Moonwort)",
    "Caladenia montana (Mountain Spider Orchid)",
    "Calochilus sandrae (Brownish Beard Orchid)",
    "Calochilus saprophyticus (Leafless Beard Orchid)",
    "Cassinia heleniae ",
    "Cassinia venusta ",
    "Cassytha phaeolasia ",
    "Celmisia sp pulchella (A snow daisy)",
    "Dampiera fusca (Kydra Dampiera)",
    "Daviesia nova-anglica ",
    "Deyeuxia reflexa ",
    "Dillwynia palustris ",
    "Discaria nitida (Leafy Anchor Plant)",
    "Diuris ochroma (Pale Golden Moths)",
    "Eucalyptus cinerea subsp. triplex  ",
    "Eucalyptus forresterae ",
    "Eucalyptus forresterae ",
    "Euphrasia scabra (Rough Eyebright)",
    "Galium roddii  ",
    "Genoplesium vernale (East Lynne Midge Orchid)",
    "Gentiana baeuerlenii (Baeuerlen's Gentian)",
    "Gentianella muelleriana subsp. jingerensis (Mueller’s Snow-gentian)",
    "Geranium sessiliflorum  ",
    "Goodenia glomerata ",
    "Grevillea imberbis ",
    "Grevillea alpivaga (Buffalo Grevillea)",
    "Grevillea macleayana ",
    "Grevillea neurophylla subsp fluviatilis  ",
    "Grevillea neurophylla subsp neurophylla  ",
    "Grevillea oxyantha subsp. ecarinata ",
    "Grevillea ramosissima subsp hypargyrea (Fan Grevillea)",
    "Grevillea victoriae subsp nivalis  ",
    "Grevillea victoriae subsp nivalis  ",
    "Grevillea willisii (Omeo Grevillea)",
    "Hakea macraeana ",
    "Leionema lamprophyllum subsp obovatum (Shiny Phebalium)",
    "Leptospermum namadgiensis (Namadgi Tea Tree)",
    "Logania granitica (Mountain Logania)",
    "Leucochrysum albicans var. tricolor (Hoary Sunray)",
    "Lobelia gelida (Snow Pratia)",
    "Olearia sp Rhizomatica  ",
    "Olearia stenophylla ",
    "Parantennaria uniceps  ",
    "Persoonia chamaepitys ",
    "Persoonia mollis subsp. mollis ",
    "Persoonia procumbens ",
    "Pimelea bracteata  ",
    "Pomaderris cotoneaster (Cotoneaster Pomaderris)",
    "Pomaderris gilmourii (Grey Deua Pomaderris)",
    "Pomaderris phylicifolia subsp. phylicifolia  ",
    "Prostanthera monticola (Buffalo Mint Bush)",
    "Prasophyllum canaliculatum (Summer Leek Orchid)",
    "Prasophyllum innubum (Brandy Marys leek orchid)",
    "Prasophyllum keltonii (Kelton's Leek Orchid)",
    "Prasophyllum venustum (Charming Leek Orchid)",
    "Prasophyllum viriosum (Stocky Leek Orchid)",
    "Prostanthera decussata ",
    "Prostanthera stenophylla ",
    "Prostanthera walteri ",
    "Pterostylis oreophila (Blue-tongued Greenhood / Kiandra Greenhood)",
    "Pultenaea polifolia (Dusky Bush-pea)",
    "Pultenaea vrolandii (Cupped Bush-pea)",
    "Rutidosis leiolepis (Monaro Golden Daisy)",
    "Sannantha crenulate (Fern-leaf Baeckea)",
    "Tetratheca subaphylla ",
    "Thesium austral (Austral Toadflax)",
    "Thynninorchis huntianus (Elbow Orchid)",
    "Viola improcera (Dwarf Violet)"
];
addTsToMus(["Alpine Bushfires"], alpineTEC, "Threatened Ecological Community");
addTsToMus(["Alpine Bushfires"], alpineVertebrateAnimals, "Priority Vertebrate Animals");
addTsToMus(["Alpine Bushfires"], alpineAdditionalPrioritySpecies, "Additional Priority Species");
addTsToMus(["Alpine Bushfires"], alpineInvertebrateSpecies, "Priority Invertebrate Species");
addTsToMus(["Alpine Bushfires"], alpinePriorityPlants, "Priority Plants");
addTsToMus(["Alpine Bushfires"], alpineAdditionalPlants, "Additional Priority Plants");

// greater Blue Mountain
let greaterPriorityNaturalAsset = ["Greater Blue Mountains World Heritage Area", "Gondwana Rainforests of Australia World Heritage Area"];
let greaterTEC = ["Upland Basalt Eucalypt Forests of the Sydney Basin Bioregion", "Temperate Highland Peat Swamps on Sandstone", "Lowland Rainforest of Subtropical Australia", "Coastal Swamp Oak (Casuarina glauca) Forest of New South Wales and South East Queensland", "Montane Peatlands and Swamps of the New England Tableland, NSW North Coast, Sydney Basin, South East Corner, South Eastern Highlands and Australian Alps bioregion", "Kurri Sand Swamp Woodland in the Sydney Basin Bioregion", "Lower Hunter Spotted Gum Ironbark Forest in the Sydney Basin and NSW North Coast Bioregions", "Turpentine-Ironbark Forest of the Sydney Basin Bioregion", "Littoral Rainforest and Coastal Vine Thickets of Eastern Australia", "Castlereagh Scribbly Gum and Agnes Banks Woodlands of the Sydney Basin Bioregion"];
let greaterPriorityVertebrateAnimals = [
    "Eulamprus leuraensis (Blue Mountains Water Skink)",
    "Hoplocephalus bungaroides (Broad-headed Snake)",
    "Phyllurus platurus (Southern Leaf-Tailed Gecko, Broad-tailed Gecko)",
    "Origma solitaria (Rockwarbler)",
    "Petrogale penicillata (Brush-tailed rock-wallaby)",
    "Petauroides volans (Greater glider)",
    "Petaurus australis (Yellow-bellied glider)",
    "Phascolarctos cinereus (Koala)",
    "Dasyurus maculatus maculatus (Spotted-tail quoll)",
    "Pteropus poliocephalus (Grey-headed flying-fox)",
    "Ornithorinchus anatinus (Platypus)",
    "Anthochaera phrygia (Regent Honeyeater)",
    "Callocephalon fimbriatum (Gang-gang Cockatoo)",
    "Calyptorhynchus lathami lathami (South-eastern Glossy Black-cockatoo)",
    "Mixophyes balbus (Stuttering Frog)",
    "Mixophyes iteratu (Giant Barred Frog)",
    "Dasyornis brachypterus (Eastern Bristlebird)",
    "Atrichornis rufescens (Rufous Scrub-bird)",
    "Notomacropus parma (Parma Wallaby)",
    "Pseudomys oralis (Hastings River Mouse)",
    "Drysdalia rhodogaster (Mustard-bellied Snake)",
    "Calyptotis ruficauda (Red-tailed Calyptotis)",
    "Saltuarius moritzi (Moritz’s leaf-tail gecko)",
    "Antechinus mimetes (Dusky Antechinus)",
    "Phoniscus papuensis (Golden-tipped Bat)",
    "Pseudomys oralis (Hastings River Mouse, Koontoo)",
    "Litoria littlejohni (Littlejohn's Tree Frog, Heath Frog)",
    "Heleioporus australiacus (Giant Burrowing Frog)",
    "Mixophyes balbus (Stuttering Frog, Southern Barred Frog)",
    "Philoria sphagnicola (Sphagnum Frog)",
    "Litoria daviesae (Davies’ Tree Frog)",
    "Mixophyes iteratus (Giant Barred Frog)",
    "Macquaria australasica 'MDB taxa' (Macquarie Perch)",
    "Macquarie sp. nov. 'Hawkesbury taxon' (Blue Mountains Perch, Hawkesbury Perch)",
    "Pycnoptilus floccosus (Pilotbird)",
    "Menura novaehollandiae (Superb Lyrebird)",
    "Climacteris erythrops (Red-browed Treecreeper)",
    "Atrichornis rufescens (Rufous Scrub-bird)",
    "Monarcha melanopsis (Black-faced Monarch)",
    "Dasyornis brachypterus (Eastern Bristlebird)",
    "Pezoporus wallicus wallicus (Mainland Ground Parrot)"
];
let greaterAdditionalPrioritySpecies = [
    "(Blue Mountains Perch)",
    "(Giant Burrowing Frog)",
    "(Red-crowned Toadlet)",
    "(Little Bent-winged Bat)",
    "(Barking Owl)",
    "(Masked Owl)",
    "(Powerful Owl)",
    "(Sooty Owl)",
    "Myuchelys purvisi (Manning River Helmeted Turtle, Purvis' Turtle)",
    "Mastacomys fuscus mordicus (Broad-toothed Rat)",
    "Potorous tridactylus tridactylus (Long-nosed Potoroo)",
    "Pseudomys novaehollandiae (New Holland Mouse Pookila)"
];
let greaterInvertebrateSpecies = [
    "Pelecorhynchus niger (Fly)",
    "(Jewel Beetle)",
    "Coricudgia wollemiana (Coricudgy Pinwheel Snail)",
    "Macrophallikoropa stenoumbilicata (Wolllemi Pinwheel Snail)",
    "Pelecorhynchus nebulosus (Fly)",
    "Matthewsius rossi (Beetle)",
    "Marilyniropa jenolanensis (Jenolan Pinwheel Snail)",
    "Pommerhelix depressa (Jenolan Caves Woodland Snail)",
    "Austrochloritis wollemiensis (Wollemi Bristle Snail)",
    "Figulus trilobus (Beetle)",
    "Pelecorhynchus lineatus (Fly)",
    "Petalura gigantea (Giant Dragonfly)",
    "Paralucia spinifera (Bathurst Copper Butterfly)",
    "Euastacus suttoni (Sutton’s Crayfish)",
    "Euastacus spinichelatus (Small Crayfish)",
    "Euastacus polysetosus (Many Bristled Crayfish)",
    "Euastacus gamilaroi (Hanging Rock Crayfish)",
    "Pommerhelix monacha (Blue Mountains Woodland Snail)",
    "Austrochloritis kanangra (Jenolan Caves Bristle Snail)",
    "Mesodina aeluropis (Montane Iris-skipper; Aeluropis Skipper)",
    "Xylocopa aeratus (Green Carpenter Bee, Metallic Green Carpenter Bee, Southern Green Carpenter Bee)",
    "Paralaoma annabelli (Prickle Pinhead Snail)",
    "Matthewsius illawarrensis (Beetle)",
    "Storenosoma terraneum (Spider, harvestman or pseudoscorpion)",
    "Molycria mammosa (Spider, harvestman or pseudoscorpion)",
    "Austropetalia patricia (Waterfall Redspot)",
    "Aulacopris reichei (Beetle)",
    "Diorygopyx incrassatus (Beetle)",
    "Coripera morleyana (Beetle)",
    "Hyridella depressa (Depressed Mussel; Knife-shaped Mussel)",
    "Pelecorhynchus distinctus (Fly)",
    "Oreixenica latialis latialis (Small Alpine Xenica)",
    "Venatrix australiensis (Spider, harvestman or pseudoscorpion)",
    "Asteron grayi (Spider, harvestman or pseudoscorpion)",
    "Gyrocochlea wauchope (Wauchope Pinwheel Snail)",
    "Tetramorium confusum (Ant, wasp or bee)",
    "Cordulephya divergens (Clubbed Shutwing)",
    "Telicota eurychlora (Dingy Darter, Sedge Darter, Southern Sedge Darter)",
    "Australatya striolata (Eastern Freshwater Shrimp)",
    "Pelecorhynchus rubidus (Fly)",
    "Trichophthalma bivitta (Fly)",
    "Candalides absimilis edwardsi (Glistening Pencil-blue; Common Pencilled-blue)",
    "Meridolum jervisensis (Jervis Bay Forest Snail)",
    "(Jewel Beetle)",
    "Caliagrion billinghursti (Large Riverdamsel)",
    "Pleuropoma jana (Macleay Valley Droplet-snail)",
    "Elsothera kyliestumkatae (Mount Seaview Pinwheel Snail)",
    "Oreixenica correae (Orange Alpine Xenica; Correa Brown)",
    "Gyrocochlea planorbis (Port Stephens Pinwheel Snail)",
    "Graycassis bruxner (Spider, harvestman or pseudoscorpion)",
    "Rhynchochydorus australiensis (Water Flea)",
    "Kirkaldyella rugosa (Hemiptera (bug))"
];
let greaterPriorityPlants =[
    "Hibbertia cistiflora subsp. quadristaminea",
    "Persoonia hindii",
    "Persoonia recedens",
    "Leucochrysum graminifolium",
    "Eucalyptus bensonii (Benson’s Stringybark)",
    "Leptospermum petraeum,",
    "Hakea dohertyi (Kowmung Hakea)",
    "Almaleea incurvata",
    "Acacia alaticaulis (Winged Sunshine Wattle)",
    "Veronica brownii",
    "Hibbertia acaulothrix",
    "Eucalyptus corticosa (Olinda Box)",
    "Darwinia taxifolia subsp. taxifolia",
    "Dillwynia stipulifera",
    "Haloragodendron lucasii",
    "Persoonia oblongata",
    "Persoonia mollis subsp. Mollis",
    "Epacris purpurascens var. onosmiflora",
    "Eucalyptus rudderi (Rudder's Box)",
    "Pultenaea glabra (Smooth Bush-pea, Swamp Bush-pea)",
    "Hakea pachyphylla",
    "Haloragodendron gibsonii",
    "Leptospermum macrocarpum",
    "Isopogon fletcheri (Fletcher's Drumsticks)",
    "Acacia saliciformis (Willow Wattle)",
    "Banksia penicillata",
    "Baeckea kandos",
    "Brachyscome brownii",
    "Wollemia nobilis (Wollemi Pine)",
    "Apatophyllum constablei",
    "Cyphanthera scabrella",
    "Trachymene scapigera (Mountain Trachymene)",
    "Eucalyptus cunninghamii (Cliff Mallee Ash)",
    "Persoonia acerosa (Needle Geebung)",
    "Ochrosperma oligomerum",
    "Hakea constablei",
    "Veronica lithophila",
    "Acacia clunies-rossiae (Kowmung Wattle, Kanangra Wattle)",
    "Leionema lamprophyllum subsp. Orbiculare",
    "Prasophyllum fuscum (Tawny Leekorchid, Slaty Leekorchid)",
    "Hibbertia saligna",
    "Eucalyptus sp. Howes Swamp Creek",
    "Callitris muelleri (Mueller’s Cypress)",
    "Grevillea kedumbensis",
    "Allocasuarina defungens (Dwarf Heath Casuarina)",
    "Grevillea imberbis",
    "Pomaderris brunnea (Rufous Pomaderris)",
    "Actinotus forsythii (Wiry Flannel flower)",
    "Eucalyptus gregsoniana (Wolgan Snow Gum)",
    "Hibbertia coloensis",
    "Spyridium burragorang",
    "Pomaderris sericea (Bent Pomaderris)",
    "Grevillea evansiana (Evan’s Grevillea)",
    "Boronia deanei (Deane's Boronia)",
    "Prostanthera caerulea",
    "Leptospermum spectabile",
    "Grevillea buxifolia subsp. ecorniculata",
    "Epacris hamiltonii",
    "Velleia perfoliata",
    "Solanum armourense",
    "Prostanthera stenophylla",
    "Dillwynia brunioides",
    "Acacia hamiltoniana (Hamilton's Wattle)",
    "Goodenia heterophylla subsp. montana",
    "Banksia paludosa subsp. astrolux (Swamp Banksia)",
    "Schoenus evansianus",
    "Prostanthera saxicola var. montana",
    "Grevillea aspleniifolia",
    "Genoplesium superbum (Superb Midgeorchid)",
    "Goodenia rostrivalvis",
    "Olearia covenyi",
    "Asterolasia rivularis",
    "Grevillea acanthifolia (Bog Grevillea)",
    "Hibbertia circinata",
    "Acacia jonesii (Jones Wattle)",
    "Acacia meiantha",
    "Callistemon megalongensis (Megalong Valley Bottlebrush)",
    "Hymenophyllum pumilum",
    "Grevillea guthrieana",
    "Acacia olsenii (Olsen’s Wattle)",
    "Zieria caducibracteata",
    "Macrozamia montana",
    "Acacia trinervata (Three-nerved Wattle)",
    "Deyeuxia reflexa",
    "Eucalyptus macarthurii (Camden Woollybutt, Paddys River Box)",
    "Pomaderris cotoneaster (Cotoneaster Pomaderris)",
    "Acacia covenyi (Blue Bush, Bluebush, Bendethera Wattle)",
    "Microlaena stipoides var. breviseta",
    "Acacia tessellata",
    "Telopea mongaensis (Monga Waratah, Braidwood Waratah)",
    "Styphelia perileuca",
    "Acacia chalkeri (Chalker's Wattle)",
    "Callistemon subulatus (Dwarf Bottlebrush)",
    "Leptospermum rotundifolium",
    "Grevillea linsmithii (Linsmith's Grevillea)",
    "Lasiopetalum joyceae",
    "Asterolasia buxifolia",
    "Grevillea acerata",
    "Prostanthera teretifolia"
];
let greaterAdditionalPlants = [
    "Eucalytus macarthurii (Paddys River Box)",
    "Wollemia nobilis (Wollemi Pine)",
    "Pherosphaera fitzgeraldii (Dwarf Mountain Pine)",
    "Zieria convenyi (Coveny’s Zieria)",
    "Leionema lachnaeoides",
    "Grevillea obtusiflora ssp",
    "Diuris aequalis (Donkey Orchid)",
    "Epacris sparsa",
    "Isopogon fletcheri (Fletchers Drumsticks)",
    "Trachymene saniculifolia",
    "Bertya sp.",
    "Grevillea evansiana (Evans Grevillea)",
    "Hibbertia puberula",
    "Hibbertia sp. Bankstown",
    "Pultenaea sp. Olinda",
    "Leionema sympetalum (Rylstone Bell)",
    "Velleia perfoliata",
    "Zieria murphyi (Velvet Zieria)"
];
addTsToMus(["Greater Blue Mountains Bushfires"],greaterPriorityNaturalAsset, "Priority Natural Asset");
addTsToMus(["Greater Blue Mountains Bushfires"], greaterTEC, "Threatened Ecological Community");
addTsToMus(["Greater Blue Mountains Bushfires"], greaterPriorityVertebrateAnimals, "Priority Vertebrate Animals");
addTsToMus(["Greater Blue Mountains Bushfires"], greaterAdditionalPrioritySpecies, "Additional Priority Species");
addTsToMus(["Greater Blue Mountains Bushfires"], greaterInvertebrateSpecies, "Priority Invertebrate Species");
addTsToMus(["Greater Blue Mountains Bushfires"], greaterPriorityPlants, "Priority Plants");
addTsToMus(["Greater Blue Mountains Bushfires"], greaterAdditionalPlants, "Additional Priority Plants");
// East GippsLand
var eastGippslandTEC = []
let eastGippslandPriorityVertebrateAnimals = [
    "Potorous longipes (Long-footed potoroo)",
    "Pseudomys fumeus (Smoky Mouse, Konoom)",
    "Potorous tridactylus (Long-nosed Potoroo)",
    "Antechinus mimetes (Dusky Antechinus)",
    "Mastacomys fuscus mordicus (Broad-toothed Rat)",
    "Petaurus australis (Yellow-bellied Glider)",
    "Petauroides volans (Greater Glider)",
    "Ornithorhynchus anatinus (Platypus)",
    "Petrogale penicillata (Brush-tailed Rock-wallaby)",
    "Pycnoptilus floccosus (Pilotbird)",
    "Menura novaehollandiae (Superb Lyrebird)",
    "Dasyornis brachypterus (Eastern bristlebird)",
    "Climacteris erythrops (Red-browed Treecreeper)",
    "Callocephalon fimbriatum (Gang-gang Cockatoo)",
    "Pezoporus wallicus (Eastern Ground Parrot)",
    "Anthochaera phrygia (Regent Honeyeater)",
    "Galaxias aequipinnis (Gippsland Galaxias)",
    "Monarcha melanopsis (Black-faced Monarch)",
    "Galaxias species 17 'Cann' (Cann Galaxias)",
    "Galaxias mcdowalli (McDowall's Galaxias)",
    "Galaxias sp. nov. 'yalmy' (Yalmy Galaxias)",
    "Galaxias terenasus (Roundsnout Galaxias)",
    "Galaxias mungadhan (Dargo Galaxias)",
    "Mordacia praecox (Non-parasitic Lamprey)",
    "Pseudemoia rawlinsoni (Glossy Grass Skink, Swampland Cool-skink, Rawlinson’s Window-eyed Skink)",
    "Eulamprus tympanum (Southern Water-skink)",
    "Pseudemoia cryodroma (Alpine Bog Skink, Alpine Bog-skink)",
    "Cyclodomorphus praealtus (Alpine She-oak Skink)",
    "Litoria littlejohni (Littlejohn’s Tree Frog, Heath Frog)",
    "Heleioporus australiacus (Giant Burrowing Frog)",
    "Litoria spenceri (Spotted Tree Frog)",
    "Litoria verreauxii alpina (Alpine Tree Frog, Verreaux’s Alpine Tree Frog)"
];
let eastGippslandAdditionalPrioritySpecies = [
    "Calyptorhynchus lathami (Glossy Black-Cockatoo)",
    "Tyto novaehollandiae (Masked Owl)",
    "Petauroides volans (Southern Greater Glider)",
    "Pezoporus wallicus (Ground Parrot)",
    "Litoria littlejohni (Large Brown Tree Frog)",
    "Dasyurus maculatus (Spot-tailed Quoll)",
    "Heleioporus australiacus (Giant Burrowing Frog)",
    "Isoodon obesulus (Southern Brown Bandicoot)",
    "Perameles nasuta (Southern Long-nosed Bandicoot)",
    "Mixophyes balbus (Southern Barred Frog)",
    "Morelia spilota (Diamond python)",
    "Prototroctes maraena (Australian Grayling)",
    "Macquaria australasica (Macquarie Perch)"
];
let eastGippslandInVertebrateSpecies = [
    "Euastacus sp. 1 (Arte spiny crayfish)",
    "Euastacus sp. 2 (Cann spiny crayfish)",
    "Euastacus bidawalus (East Gippsland spiny crayfish)",
    "Euastacus sp. 3 (West Snowy spiny crayfish)",
    "Euastacus diversus (Orbost spiny crayfish)",
    "Telicota eurychlora (Sedge darter)",
    "Euastacus claytoni (Calyton's Crayfish)",
    "Paralaoma annabelli (Annabelll's Pinhead Snail, Prickle Pinhead Snail)",
    "Australatya striolata (Eastern Freshwater Shrimp)",
    "Aulacopris reichei (a dung beetle)",
    "Austrorhytida glaciamans (Kosciuszko Carnivorous Snail)",
    "Austropetalia patricia (Waterfall Redspot)",
    "Diphyoropa illustra (Lakes Entrance Pinwheel Snail)",
    "Hyridella depressa (Depressed Mussel; Knife-shaped Mussel)",
    "Pommerhelix mastersi (Merimbula Woodland Snail)",
    "Castiarina kershawi (a jewel beetle)",
    "Austrochloritis kosciuszkoensis (Kosciuszko Bristle Snail)",
    "Oreixenica orichora (Spotted Alpine Xenica)",
    "Asteron grayi ",
    "Austroaeschna flavomaculata (Alpine Darner)",
    "Storenosoma terraneum"
];
let eastGippslandPriorityPlants = [
    "Banksia croajingolensis (Gippsland Banksia)",
    "Callistemon kenmorrisonii (Betka Bottlebrush)",
    "Grevillea pachylostyla (Buchan River Grevillea)",
    "Leptospermum jingera ",
    "Pomaderris buchanensis ",
    "Eucalyptus forresterae (Brumby Sallee)",
    "Nematolepis frondosa (Leafy Nematolepis)",
    "Leucopogon riparius ",
    "Pomaderris oblongifolia ",
    "Callistemon forresterae (Forrester's Bottlebrush)",
    "Acacia lanigera var. gracilipes (Woolly Wattle, Hairy Wattle)",
    "Brachyscome riparia (Snowy River Daisy)",
    "Eucalyptus elaeophloia (Olive Mallee)",
    "Eucalyptus phoenix (Brumby Mallee-gum)",
    "Grevillea polychroma (Tullach Ard Grevillea)",
    "Deyeuxia ramosa (Climbing Bent-grass)",
    "Eucalyptus mackintii ",
    "Olearia rugosa subsp. angustifolia ",
    "Leptospermum glabrescens (Smooth Tea-tree)",
    "Prostanthera walteri (Blotchy Mintbush)",
    "Monotoca rotundifolia ",
    "Pultenaea parrisiae (Bush-pea)",
    "Tetratheca subaphylla ",
    "Hibbertia notabilis (Howe Guinea-flower)",
    "Viola improcera ",
    "Acacia lucasii (Woolly-bear Wattle, Lucas's Wattle)",
    "Dampiera fusca ",
    "Spyridium cinereum (Tiny Spyridium)",
    "Banksia canei (Mountain Banksia)",
    "Callistemon subulatus (Dwarf Bottlebrush)",
    "Deyeuxia talariata ",
    "Nematolepis squamea subsp. coriacea (Harsh Nematolepis)",
    "Grevillea neurophylla ",
    "Grevillea parvula ",
    "Persoonia brevifolia ",
    "Acacia subporosa (Narrow-leaf Bower Wattle, Sticky Bower Wattle, River Wattle, Bower Wattle)",
    "Actinotus forsythii (Wiry Flannel-flower)",
    "Caladenia tessellata (Thick-lipped Spider-orchid, Daddy long legs)",
    "Eucalyptus fraxinoides (White Mountain Ash, White Ash)",
    "Acacia subtilinervis (Net-veined Wattle)",
    "Pomaderris cotoneaster (Cotoneaster Pomaderris)",
    "Prasophyllum morganii (Mignonette Leek-orchid, Cobungra Leek-orchid, Dense Leek-orchid)"
];
let eastGippslandAdditionalPlants = [
    "Correa lawrenceana var. genoensis (Genoa River Correa)",
    "Cryptostylis hunteriana (Leafless Tongue-orchid)",
    "Pomaderris sericea (Bent Pomaderris)",
    "Grevillea celata (Colquhoun Grevillea)",
    "Pomaderris brunnea (Rufous Pomaderris)",
    "Westringia cremnophila (Snowy River Westringia)",
    "Acacia caerulescens (Limestone Blue Wattle)",
    "Olearia astroloba (Marble Daisy-bush)",
    "Deyeuxia pungens (Narrow-leaf Bent-grass)",
    "Pterostylis oreophila (Blue-tongue Greenhood)",
    "Symplocos thwaitesii (Buff Hazelwood)"
];

addTsToMus(["East Gippsland Bushfires"], eastGippslandPriorityVertebrateAnimals, "Priority Vertebrate Animals");
addTsToMus(["East Gippsland Bushfires"], eastGippslandAdditionalPrioritySpecies, "Additional Priority Species");
addTsToMus(["East Gippsland Bushfires"], eastGippslandInVertebrateSpecies, "Priority Invertebrate Species");
addTsToMus(["East Gippsland Bushfires"], eastGippslandPriorityPlants, "Priority Plants");
addTsToMus(["East Gippsland Bushfires"], eastGippslandAdditionalPlants, "Additional Priority Plants");
// Kangaroo Island
let kangarooPriorityVertebrateAnimals = [
    "Sminthopsis griseoventer aitkeni (Kangaroo Island dunnart)",
    "Stipiturus malachurus halmaturinus (Kangaroo Island southern emu-wren)",
    "Calyptorhynchus lathami halmaturinus (Glossy black-cockatoo (Kangaroo Island), Glossy black-cockatoo (South Australian))",
    "Psophodes nigrogularis lashmari (Kangaroo Island whipbird)",
    "Tachyglossus aculeatus multiaculeatus (Kangaroo Island echidna)",
    "Zoothera lunulata halmaturina (Bassian thrush (South Australian))",
    "Ornithorhynchus anatinus (Platypus)",
    "Callocephalon fimbriatum (Gang-gang Cockatoo)"
];
let kangarooPriorityInvertebrateSpecies = [
    "Moggdridgea rainbowi (Kangaroo Island Micro-trapdoor spider)",
    "Zephyrarchaea austini (Kangaroo Island Assassin spider)",
    "Nunciella kangarooensis (Western Kangaroo Island Harvestman)",
    "Xylocopa aeratus (Green Carpenter Bee)",
    "Ogyris halmaturia (Large Eastern Bronze Azure Butterfly)",
    "Ogyris otanes (Small Bronze Azure Butterfly)",
    "Psacadonotus insulanus (Kangaroo Island Robust Fan-winged Katydid)",
    "Metaballus mesopterus (Kangaroo Island Marauding Katydid)",
    "Apteronomus bordaensis / Apteronomus tepperi (Raspy Cricket)",
    "Cupedora tomsetti (Tomsett's Shrubland Snail)",
    "Glyptorhagada bordaensis (Cape Borda Corrugated Snail)",
    "Paralaoma annabelli (Prickle Pinhead Snail)",
    "Abantiades sp. n. Kangaroo Island (per E. Beaver)",
    "Oxycanus sp. n. 'Kartus' (per E. Beaver)"
];
let kangarooPriorityPlants = [
    "Acrotriche halmaturina (Kangaroo Island Ground-berry)",
    "Adenanthos macropodianus (Kangaroo Island Gland Flower)",
    "Asperula tetraphylla (Mountain Woodruff)",
    "Asterolasia muricata",
    "Calytrix smeatoniana (Kangaroo Island Heath-myrtle)",
    "Cheiranthera volubilis",
    "Choretrum spicatum (Kangaroo Island Spiked Sour-bush)",
    "Correa calycina var. halmaturorum (De Mole River Correa)",
    "Dampiera lanceolata var. insularis (Kangaroo Island Dampiera)",
    "Eucalyptus remota (Kangaroo Island Ash)",
    "Gahnia halmaturina (Kangaroo Island Saw-sedge)",
    "Gahnia hystrix (Kangaroo Island Spiky Saw-sedge)",
    "Grevillea halmaturina subsp. halmaturina (Small-flower Grevillea)",
    "Grevillea lavandulacea subsp. rogersii (Lavender Grevillea)",
    "Grevillea quinquenervis (Five-veined Grevillea)",
    "Hakea aenigma (Enigma Hakea)",
    "Hibbertia empetrifolia subsp. radians (Scrambling Guinea-flower)",
    "Hibbertia glebosa subsp. oblonga (Stalked Guinea-flower)",
    "Hibbertia platyphylla subsp. halmaturina (Robust Guinea-flower)",
    "Hydrocotyle crassiuscula (Spreading Pennywort)",
    "Irenepharsus phasmatodes (Kangaroo Island Cress)",
    "Leionema equestre (Kangaroo Island Phebalium)",
    "Lepyrodia valliculae (Kangaroo Island Scale-rush)",
    "Logania insularis (Kangaroo Island Logania)",
    "Logania scabrella (Rough Logania)",
    "Platysace heterophylla var. tepperi (Lobed Platysace)",
    "Pultenaea trifida (Kangaroo Island Bush-pea)",
    "Stylidium tepperianum (Tepper's Trigger-plant)",
    "Tetratheca halmaturina (Curly Pink-bells)",
    "Tetratheca insularis (Kangaroo Island Pink-eyes)",
    "Zieria veronicea subsp. insularis (Pink Zieria)"
];

addTsToMus(["Kangaroo Island Bushfires"], kangarooPriorityVertebrateAnimals, "Priority Vertebrate Animals");
addTsToMus(["Kangaroo Island Bushfires"], kangarooPriorityInvertebrateSpecies, "Priority Invertebrate Species");
addTsToMus(["Kangaroo Island Bushfires"], kangarooPriorityPlants, "Priority Plants");

//  North Coast and Tablelands
let nswNorthPriorityNaturalAsset = ["Gondwana Rainforests of Australia World Heritage Area"]
let northCoastAndTableLandsTEC = [ "New England Peppermint (Eucalyptus nova-anglica) Grassy Woodlands", "Lowland Rainforest of Subtropical Australia", "Coastal Swamp Oak (Casuarina glauca) Forest of New South Wales and South East Queensland ecological community"]
let nswNorthPriorityVertebrateAnimals = [
    "Pseudomys oralis (Hastings River Mouse, Koontoo)",
    "Notamacropus parma (Parma Wallaby)",
    "Pseudomys novaehollandiae (New Holland Mouse, Pookila)",
    "Petrogale penicillata (Brush-tailed Rock-wallaby)",
    "Potorous tridactylus tridactylus (Long-nosed Potoroo (SE Mainland))",
    "Petaurus australis (Yellow-bellied Glider)",
    "Dasyurus maculatus maculatus (Spot-tailed Quoll, Spotted-tail Quoll, Tiger Quoll)",
    "Petauroides volans (Greater Glider)",
    "Phascolarctos cinereus (Koala)",
    "Phoniscus papuensis (Golden-tipped Bat)",
    "Ornithorhynchus anatinus (Platypus)",
    "Atrichornis rufescens (Rufous Scrub-bird)",
    "Menura alberti (Albert's Lyrebird)",
    "Menura novaehollandiae (Superb Lyrebird)",
    "Climacteris erythrops (Red-browed Treecreeper)",
    "Calyptorhynchus lathami lathami (Glossy Black-Cockatoo (eastern))",
    "Monarcha melanopsis (Black-faced Monarch)",
    "Anthochaera phrygia (Regent Honeyeater)",
    "Pezoporus wallicus (Eastern Ground Parrot)",
    "Dasyornis brachypterus (Eastern Bristlebird)",
    "Saltuarius kateae (Kate's Leaf-tail Gecko)",
    "Harrisoniascincus zia (Rainforest Cool-skink)",
    "Saltuarius moritzi (Mortiz’s Leaf-tail gecko)",
    "Saltuarius wyberba (Granite Leaf-tailed Gecko)",
    "Calyptotis ruficauda (Red-tailed Calyptotis)",
    "Wollumbinia georgesi (Georges' Snapping Turtle, Bellinger River Snapping Turtle, Georges Helmeted Turtle)",
    "Coeranoscincus reticulatus (Three-toed Snake-tooth Skink)",
    "Myuchelys purvisi (Manning River Helmeted Turtle, Purvis' Turtle)",
    "Wollumbinia belli (Bell's Turtle, Western Sawshelled Turtle, Namoi River Turtle, Bell's Saw-shelled Turtle)",
    "Maccullochella ikei (Clarence River Cod, Eastern Freshwater Cod)",
    "Nannoperca oxleyana (Oxleyan Pygmy Perch)",
    "Mordacia praecox (Non-parasitic Lamprey)",
    "Philoria pughi (Pugh's Frog)",
    "Philoria sphagnicolus (Sphagnum Frog)",
    "Litoria subglandulosa (New England treefrog, Glandular Frog)",
    "Philoria kundagungan (Mountain Frog)",
    "Mixophyes iteratus (Giant Barred Frog, Southern Barred Frog)",
    "Litoria piperata (Peppered Tree Frog)",
    "Mixophyes balbus (Stuttering Frog, Southern Barred Frog)",
    "Litoria daviesae (Davies' Tree Frog)",
    "Philoria richmondensis (Richmond Range Sphagnum Frog)",
    "Mixophyes fleayi (Fleay's Frog)",
    "Euastacus clarkae (Ellen Clark's Crayfish)",
    "Euastacus pilosus (Hairy Cataract Crayfish)",
    "Euastacus simplex (Small Mountain Crayfish)",
    "Euastacus gumar (Bloodclaw Crayfish)",
    "Euastacus spinichelatus (Small Crayfish)",
    "Euastacus girurmulayn (Smooth Crayfish)",
    "Euastacus gamilaroi (Hanging Rock Crayfish / Gamilaroi Spiny Crayfish)",
    "Euastacus jagabar (Blue Black Crayfish)",
    "Cherax leckii (Leckie's Crayfish)",
    "Euastacus morgani (Morgan's Crayfish)",
    "Euastacus dalagarbe (Mud Gully Crayfish)"
];
let nswNorthAdditionalPrioritySpecies = [
    "(Dusky Antechinus)",
    "(Eastern Bent-winged Bat)",
    "(Little Bent-winged Bat)",
    "(Hoary Wattled Bat)",
    "(Eastern Pipistrelle)",
    "(Barking Owl)",
    "(Powerful Owl)",
    "(Masked Owl)",
    "(Sooty Owl)",
    "(Fawn-footed Melomy)",
    "(Stephen’s Banded Snake)",
    "(Rufous Bettong)",
    "(Spotted Quail Thrush)",
    "(Coastal Petaltail)"
];
let nswNorthPriorityInvertebrateSpecies = [
    "Rhophodon palethorpei (Palethorpe's Pinwheel Snail)",
    "Anisynta cynone anomala (Mottled Grass-skipper)",
    "Austrochloritis marksandersi (Mount Sebastopol Bristle Snail)",
    "Letomola lanalittleae (Sunburst Pinwheel Snail)",
    "Egilomen sebastopol (Sebastopol Pinwheel Snail)",
    "Macleayropa kookaburra (Kookaburra Pinwheel Snail)",
    "Eritingis trivirgata (a lace bug)",
    "Gyrocochlea janetwaterhouseae (Macleay Valley Pinwheel Snail)",
    "Macleayropa boonanghi (Boonanghi Pinwheel Snail)",
    "Elsothera kyliestumkatae (Mount Seaview Pinwheel Snail)",
    "Austrochloritis kippara (Kippara Forest Bristle Snail)",
    "Epimixia vulturna (a lace bug)",
    "Austrochloritis seaviewensis (Mount Seaview Bristle Snail)",
    "Diphyoropa macleayana (Kempsey Copper Pinwheel Snail)",
    "Galadistes akubra (Macleay Valley Woodland Snail)",
    "Mesodina aeluropis (Aeluropis Skipper, Mountain Skipper)",
    "Gyrocochlea wauchope (Wauchope Pinwheel Snail)",
    "Rhophodon kempseyensis (Lustrous Pinwheel Snail)",
    "Luturopa macleayensis (Macleay Waxy Pinwheel Snail)",
    "Scelidoropa nandewar (Nandewar Range Pinwheel Snail)",
    "Macleayropa carraiensis (Carrai Pinwheel Snail)",
    "Georissa laseroni (Macleay Valley Microturban)",
    "Austrochloritis abbotti (Yessabah Caves Bristle Snail)",
    "Pleuropoma jana (Macleay Valley Goblet-snail, Macleay Valley Droplet-snail)",
    "Vitellidelos dorrigoensis (Dorrigo Carnivorous Snail)",
    "Discocharopa expandivolva (Flared White Pinwheel Snail)",
    "Graycassis bruxner (a spider)",
    "Tetramorium confusum (an ant)",
    "Acanthaeschna victoria (Thylacine Darner)",
    "Molycria mammosa (a spider)",
    "Graycassis dorrigo (a spider)",
    "Austrochloritis paucisetosa (Macksville Bristle Snail)",
    "Coripera morleyana (a tenebrionid beetle)",
    "Australatya striolata (Eastern Freshwater Shrimp)",
    "Oreixenica correae (Orange Alpine Xenica; Correa Brown)",
    "Venatrix australiensis (a spider)",
    "Petalura gigantea (Giant Dragonfly)",
    "Storenosoma terraneum (a spider)",
    "Lampona fife (a spider)",
    "Safrina dekeyzeri (a lucanid beetle)",
    "Austrorhytida nandewarensis (Nandewar Carnivorous Snail)",
    "Caliagrion billinghursti (Large Riverdamsel)",
    "Coenocharopa yessabahensis (Yessabah Pinwheel Snail)",
    "Letomola contortus (Contorted Pinwheel Snail)",
    "Telicota eurychlora (Dingy Darter, Sedge Darter, Southern Sedge Darter)"
];
let nswNorthPriorityPlants = [
    "Kardomia prominens",
    "Boronia inflexa subsp torringtonensis",
    "Eucalyptus pachycalyx subsp. Banyabba (Banyabba Shiny-barked Gum)",
    "Cassinia heleniae",
    "Prostanthera staurophylla",
    "Macrozamia johnsonii",
    "Gentiana wissmannii (New England Gentian)",
    "Eucalyptus scopulorum",
    "Olearia oliganthema",
    "Homoranthus binghiensis (Binghi Homoranthus)",
    "Styphelia perileuca"
];
let nswNorthAdditionalPriorityPlants = [
    "Acacia beadleana",
    "Callistemon sp.",
    "Eucalyptus scopulorum",
    "Grevillea acanthifolia",
    "Hibbertia rhynchocalyx",
    "Olearia sp.",
    "Pomaderris helianthemifolia",
    "Prostanthera sp.",
    "Zieria hindii",
    "Luzula flaccida subsp.",
    "Cassinia theodorii",
    "Juncus laeviusculus",
    "Allocasuarina defungens",
    "Astrotricha cordata",
    "Bertya sp.",
    "Diuris eborensis",
    "Eucalyptus pachycalyx subsp. banyabba",
    "Grevillea guthrieana",
    "Hakea dohertyi",
    "Macrozamia johnsonii",
    "Philotheca obovatifolia",
    "Zieria floydii",
    "Almaleea cambagei",
    "Asterolasia beckersii",
    "Chiloglottis anaticeps",
    "Grevillea mollis",
    "Hibbertia hexandra",
    "Homoranthus binghiensis",
    "Melichrus sp. Gibberagee",
    "Pimelea venosa",
    "Pterostylis metcalfei",
    "Triplarina imbricate",
    "Uromyrtus australis",
    "Grevillea beadleana",
    "Macrozamia humilis",
    "Leucopogon confertus",
    "Grevillea linsmithii",
    "Hibbertia marginata",
    "Prostanthera palustris"
];

addTsToMus(["NSW North Coast And Tablelands Bushfires"],nswNorthPriorityNaturalAsset, "Priority Natural Asset");
addTsToMus(["NSW North Coast And Tablelands Bushfires"], northCoastAndTableLandsTEC, "Threatened Ecological Community");
addTsToMus(["NSW North Coast And Tablelands Bushfires"], nswNorthPriorityVertebrateAnimals, "Priority Vertebrate Animals");
addTsToMus(["NSW North Coast And Tablelands Bushfires"], nswNorthAdditionalPrioritySpecies, "Additional Priority Species");
addTsToMus(["NSW North Coast And Tablelands Bushfires"], nswNorthPriorityInvertebrateSpecies, "Priority Invertebrate Species");
addTsToMus(["NSW North Coast And Tablelands Bushfires"], nswNorthPriorityPlants, "Priority Plants");
addTsToMus(["NSW North Coast And Tablelands Bushfires"], nswNorthAdditionalPriorityPlants, "Additional Priority Plants");



// NSW South Coast
let nswSouthCoastTEC = [
    "Upland Basalt Eucalypt Forests of the Sydney Basin Bioregion",
    "Alpine Sphagnum Bogs and Associated Fens",
    "Illawarra Shoalhaven Subtropical Rainforest",
    "Littoral Rainforest and Coastal Vine Thickets of Eastern Australia",
    "Robertson Rainforest in the Sydney Basin Bioregion",
    "Coastal Swamp Oak (Casuarina glauca) Forest of New South Wales and South East Queensland",
    "Shale Sandstone Transition Forest of the Sydney Basin Bioregion",
    "Turpentine - Ironbark Forest in the Sydney Basin Bioregion",
    "Illawarra and South Coast Lowland Forest and Woodland",
    "Lowland Grassy Woodland in the South East Corner Bioregion",
    "Southern Highlands Shale Forest and Woodland of the Sydney Basin Bioregion",
    "Subtropical and Temperate Coastal Saltmarsh"];
let nswSouthCoastAdditionalTEC = [
    "Milton Ulladulla Subtropical Rainforest in the Sydney Basin Bioregion",
    "Dry Rainforest of the South East Forests in the South East Corner Bioregion",
    "Brogo Wet Vine Forest in the South East Corner Bioregion",
    "Freshwater Wetlands on Coastal Floodplains of the New South Wales North Coast, the Sydney Basin and South East Corner Bioregions"
];
let nswSouthCoastPriorityVertebrateAnimals = [
    "Litoria littlejohni (Littlejohn's Tree Frog, Heath Frog)",
    "Heleioporus australiacus (Giant Burrowing Frog)",
    "Mixophyes balbus (Stuttering Frog, Southern Barred Frog (in Victoria))",
    "Pseudophryne pengilleyi (Northern Corroboree Frog)",
    "Pseudophryne corroboree (Southern Corroboree Frog)",
    "Drysdalia rhodogaster (Mustard-bellied Snake)",
    "Hoplocephalus bungaroides (Broad-headed Snake)",
    "Liopholis guthega (Guthega Skink)",
    "Cyclodomorphus praealtus (Alpine She-oak Skink)",
    "Eulamprus tympanum (Southern Water-skink)",
    "Pseudemoia rawlinsoni (Glossy Grass Skink, Swampland Cool-skink, Rawlinson's Window-eyed Skink)",
    "Phyllurus platurus (Southern Leaf-Tailed Gecko, Broad-tailed Gecko)",
    "Galaxias tantangara (Stocky Galaxias)",
    "Galaxias terenasus (Roundsnout Galaxias)",
    "Mordacia praecox (Non-parasitic Lamprey)",
    "Macquaria australasica 'MDB taxa' (Macquarie Perch (Murray-Darling Basin taxa))",
    "Macquaria sp. nov. 'hawkesbury taxon' (Blue Mountains Perch)",
    "Pycnoptilus floccosus (Pilotbird)",
    "Dasyornis brachypterus (Eastern Bristlebird)",
    "Menura novaehollandiae (Superb Lyrebird)",
    "Pezoporus wallicus wallicus (Eastern Ground Parrot)",
    "Origma solitaria (Origma, Rockwarbler)",
    "Callocephalon fimbriatum (Gang-gang Cockatoo)",
    "Climacteris erythrops (Red-browed Treecreeper)",
    "Anthochaera phrygia (Regent Honeyeater)",
    "Monarcha melanopsis (Black-faced Monarch)",
    "Calyptorhynchus lathami lathami (Glossy Black-Cockatoo (eastern))",
    "Antechinus mimetes (Dusky Antechinus)",
    "Potorous longipes (Long-footed Potoroo)",
    "Potorous tridactylus tridactylus (Long-nosed Potoroo (SE Mainland))",
    "Petrogale penicillata (Brush-tailed Rock-wallaby)",
    "Petauroides volans (Greater Glider)",
    "Petaurus australis (Yellow-bellied Glider)",
    "Dasyurus maculatus maculatus (Spot-tailed Quoll, Spotted-tail Quoll, Tiger Quoll (southeastern mainland population))",
    "Pseudomys fumeus (Smoky Mouse, Konoom)",
    "Phoniscus papuensis (Golden-tipped Bat)",
    "Ornithorhynchus anatinus (Platypus)",
    "Phascolarctos cinereus (combined populations of Qld, NSW, ACT) (Koala (combined populations of Qld, NSW and the ACT))",
    "Pteropus poliocephalus (Grey-headed Flying-fox)",
    "Mastacomys fuscus mordicus (Broad-toothed Rat (mainland), Tooarrana)",
    "Pseudomys novaehollandiae (New Holland Mouse, Pookila)"
];
let nswSouthCoastAdditionalPrioritySpecies = [
    "(Southern Brown Bandicoot (eastern))",
    "(Long-nosed Potoroo)",
    "(Eastern Bristlebird)",
    "(Striated Fieldwren)",
    "(Glossy black cockatoo)",
    "(Masked Owl)",
    "(Sooty Owl)",
    "(Powerful Owl)"
];
let nswSouthCoastPriorityInvertebrateSpecies = [
    "Euastacus guwinus (Tianjara Crayfish)",
    "Euastacus suttoni (Sutton's Crayfish)",
    "Euastacus rieki (Riek's Crayfish)",
    "Euastacus claytoni (Calyton's Crayfish)",
    "Euastacus bidawalus (Bidawal Crayfish, East Gippsland Spiny Crayfish)",
    "Euastacus crassus (Alpine Crayfish)",
    "Euastacus diversus (Orbost Spiny Crayfish)",
    "Egilodonta bendethera (Bendathera Pinwheel Snail)",
    "Austrochloritis abrotonus (Bermagui Bristle Snail)",
    "Pommerhelix mastersi (Merimbula Woodland Snail)",
    "Egilodonta wyanbenensis (Wyanbene Pinwheel Snail)",
    "Meridolum jervisensis (Jervis Bay Forest Snail)",
    "Diphyoropa illustra (Lakes Entrance Pinwheel Snail)",
    "Austrorhytida glaciamans (Koscuiszko Carnivorous Snail)",
    "Paralaoma annabelli (Prickle Pinhead Snail)",
    "Austrochloritis kanangra (Jenolan Caves Bristle Snail)",
    "Austrochloritis kosciuszkoensis (Koscuiszko Bristle Snail)",
    "Pommerhelix monacha (Blue Mountains Woodland Snail)",
    "Temognatha rufocyanea (Jewel beetle)",
    "Lissapterus grammicus (Beetle)",
    "Aulacopris reichei (Beetle)",
    "Castiarina flavoviridis (Jewel beetle)",
    "Hyridella depressa (Depressed Mussel; Knife-shaped Mussel)",
    "Matthewsius illawarrensis (Beetle)",
    "Venatrix australiensis",
    "Australatya striolata (Eastern Freshwater Shrimp)",
    "Caliagrion billinghursti (Large Riverdamsel)",
    "Asteron grayi ",
    "Castiarina klugii (Jewel beetle)",
    "Temognatha rufocyanea (Jewel beetle)",
    "Oreixenica latialis latialis (Small Alpine Xenica)",
    "Storenosoma terraneum",
    "Petalura gigantea (Giant Dragonfly)",
    "Lampona fife",
    "Molycria mammosa (Spider, harvestman or pseudoscorpion)",
    "Castiarina montigena (Jewel beetle)",
    "Leptoperla cacuminis (Mount Kosciusko Wingless Stonefly)",
    "Pelecorhynchus rubidus (Fly)",
    "Pelecorhynchus flavipennis (Fly)",
    "Oreixenica orichora orichora (Spotted Alpine Xenica)",
    "Austroaeschna flavomaculata (Alpine Darner)",
    "Candalides absimilis edwardsi (Glistening Pencil-blue; Common Pencilled-blue)",
    "Oreixenica correae (Orange Alpine Xenica; Correa Brown)",
    "Acanthaeschna victoria (Thylacine Darner)",
    "Austropetalia patricia (Waterfall Redspot (191 group))",
    "Xylocopa aeratus (Green Carpenter Bee, Metallic Green Carpenter Bee, Southern Green Carpenter Bee)"
];
let nswSouthCoastPriorityPlants = [
    "Leionema ceratogynum",
    "Grevillea irrasa subsp. didymochiton",
    "Leptospermum crassifolium",
    "Darwinia taxifolia subsp. macrolaena",
    "Pultenaea baeuerlenii (Budawangs Bushpea)",
    "Grevillea baueri subsp. asperula",
    "Boronia anemonifolia subsp. wadbilligensis (Wadbilliga Sticky Boronia)",
    "Leionema coxii",
    "Eucalyptus sturgissiana (Ettrema Mallee)",
    "Boronia subulifolia",
    "Budawangia gnidioides (Budawangs Cliffheath)",
    "Leptospermum subglabratum",
    "Eucalyptus stenostoma (Jillaga Ash)",
    "Eucalyptus olsenii (Woila Gum)",
    "Boronia imlayensis",
    "Acacia olsenii (Olsen’s Wattle)",
    "Eucalyptus triflora (Pigeon House Ash, Three-flowered Ash)",
    "Zieria caducibracteata",
    "Grevillea epicroca",
    "Leptospermum deuense",
    "Pomaderris gilmourii var. gilmourii",
    "Grevillea molyneuxii (Jervis Bay Grevillea)",
    "Pomaderris gilmourii var. cana (Grey Deua Pomaderris)",
    "Leptospermum thompsonii (Monga Tea-tree)",
    "Styphelia psiloclada",
    "Eucalyptus deuaensis (Mongamulla Mallee)",
    "Eucalyptus parvula (Small-leaved Gum)",
    "Philotheca scabra subsp. latifolia",
    "Persoonia mollis subsp. leptophylla",
    "Acacia blayana (Blay's Wattle)",
    "Grevillea aspleniifolia",
    "Eucalyptus paliformis (Wadbilliga Ash)",
    "Persoonia mollis subsp. budawangensis",
    "Daviesia suaveolens (Scented Bitter-pea)",
    "Dillwynia crispii",
    "Hibbertia praemorsa",
    "Nematolepis elliptica",
    "Prostanthera tallowa",
    "Grevillea acanthifolia subsp. paludosa (Bog Grevillea)",
    "Plinthanthesis rodwayi (Budawang's Wallaby-grass)",
    "Acacia covenyi (Blue Bush, Bluebush, Bendethera Wattle)",
    "Telopea mongaensis (Monga Waratah, Braidwood Waratah)",
    "Callitris oblonga subsp. corangensis (Pygmy Cypress Pine)",
    "Pultenaea elusa (Elusive Bush-pea)",
    "Dillwynia stipulifera",
    "Persoonia asperula",
    "Bursaria calcicola",
    "Genoplesium superbum (Superb Midgeorchid)",
    "Acacia lucasii (Woolly-bear Wattle, Lucas's Wattle)",
    "Triplarina nowraensis (Nowra Heathmyrtle)",
    "Pultenaea rodwayi",
    "Eucalyptus fraxinoides (White Mountain Ash, White Ash)",
    "Genoplesium vernale (East Lynne Midgeorchid)",
    "Leptospermum rotundifolium",
    "Zieria murphyi (Velvet Zieria)",
    "Persoonia brevifolia",
    "Hibbertia circinata",
    "Schoenus evansianus",
    "Philotheca myoporoides subsp. brevipedunculata",
    "Acacia constablei (Narrabarba Wattle)",
    "Acacia jonesii (Jones Wattle)",
    "Pomaderris cotoneaster (Cotoneaster Pomaderris)",
    "Dampiera fusca (Kydra Dampiera)",
    "Gentiana bredboensis (Bredbo Gentian)",
    "Acacia lanigera var. gracilipes (Woolly Wattle, Hairy Wattle)",
    "Prostanthera saxicola var. montana",
    "Asterolasia rivularis",
    "Microlaena stipoides var. breviseta",
    "Hakea macraeana (Macrae's Hakea)",
    "Acacia hamiltoniana (Hamilton's Wattle)",
    "Pultenaea parrisiae (Bantam Bush-pea)",
    "Hibbertia acaulothrix",
    "Callistemon subulatus (Dwarf Bottlebrush)",
    "Nematolepis rhytidophylla",
    "Grevillea parvula (Genoa Grevillea)",
    "Monotoca rotundifolia (Trailing Monotoca)",
    "Eucalyptus gregsoniana (Wolgan Snow Gum)",
    "Goodenia heterophylla subsp. montana",
    "Thismia clavarioides",
    "Actinotus forsythii (Wiry Flannelflower)",
    "Dillwynia brunioides",
    "Zieria citriodora (Lemon-scented Zieria)",
    "Eucalyptus imlayensis (Imlay Mallee, Mount Imlay Mallee)",
    "Callistemon forresterae (Forrester's Bottlebrush)",
    "Boronia deanei (Deane's Boronia)",
    "Banksia canei (Mountain Banksia)",
    "Pomaderris gilmourii",
    "Banksia paludosa subsp. astrolux (Swamp Banksia)",
    "Grevillea imberbis",
    "Pultenaea vrolandii",
    "Pomaderris sericea (Bent Pomaderris)",
    "Hibbertia notabilis (Howe Guineaflower)",
    "Pterostylis oreophila (Blue-tongue Greenhood)",
    "Grevillea macleayana (Jervis Bay Grevillea)",
    "Tetratheca subaphylla (Leafless Pinkbells)",
    "Callitris muelleri (Mueller’s Cypress)",
    "Eucalyptus corticosa (Olinda Box)",
    "Haloragodendron gibsonii",
    "Hakea constablei",
    "Spyridium cinereum (Tiny Spyridium)",
    "Eucalyptus macarthurii (Camden Woollybutt, Paddys River Box)",
    "Prasophyllum fuscum (Tawny Leekorchid, Slaty Leekorchid)",
    "Correa lawrenceana var. genoensis (Genoa River Correa)",
    "Prostanthera walteri (Blotchy Mintbush)",
    "Hakea pachyphylla",
    "Acacia chalkeri (Chalker's Wattle)",
    "Hibbertia saligna",
    "Persoonia acerosa (Needle Geebung)",
    "Acacia subporosa (Narrow-leaf Bower Wattle, Sticky Bower Wattle, River Wattle, Bower Wattle)",
    "Spyridium burragorang",
    "Almaleea incurvata",
    "Hakea dohertyi (Kowmung Hakea)",
    "Epacris purpurascens var. onosmiflora",
    "Eucalyptus cunninghamii (Cliff Mallee Ash)",
    "Persoonia mollis subsp. Mollis",
    "Deyeuxia talariata",
    "Pomaderris brunnea (Rufous Pomaderris)",
    "Banksia penicillata",
    "Leptospermum glabrescens (Smooth Tea-tree)"
];
let nswSouthCoastAdditionalPriorityPlants = [
    "Acacia blayana",
    "Acacia constablei",
    "Acacia georgensis",
    "Astrotricha sp. Wallagaraugh",
    "Boronia anemonifolia subsp. wadbilligensis",
    "Boronia imlayensis",
    "Bursaria calcicola",
    "Darwinia taxifolia",
    "Eucalyptus imlayensis",
    "Galium roddii",
    "Genoplesium plumosum",
    "Gentiana bredboensis",
    "Grevillea acanthifolia",
    "Grevillea aspleniifolia",
    "Grevillea irrasa subsp. irrasa",
    "Grevillea rhyolitica",
    "Hibbertia circinata",
    "Hibbertia praemorsa",
    "Juncus laeviusculus",
    "Leionema ceratogynum",
    "Leptospermum crassifolium",
    "Nematolepis rhytidophylla",
    "Pimelea bracteata",
    "Plinthanthesis rodwayi",
    "Pomaderris gilmourii",
    "Prasophyllum innubum",
    "Pterostylis oreophila",
    "Pultenaea elusa",
    "Thismia clavarioides",
    "Zieria adenophora",
    "Zieria citriodora"
];

addTsToMus(["NSW South Coast Bushfires"],nswSouthCoastAdditionalTEC, "Additional Threatened Ecological Community");
addTsToMus(["NSW South Coast Bushfires"], nswSouthCoastTEC, "Threatened Ecological Community");
addTsToMus(["NSW South Coast Bushfires"], nswSouthCoastPriorityVertebrateAnimals, "Priority Vertebrate Animals");
addTsToMus(["NSW South Coast Bushfires"], nswSouthCoastAdditionalPrioritySpecies, "Additional Priority Species");
addTsToMus(["NSW South Coast Bushfires"], nswSouthCoastPriorityInvertebrateSpecies, "Priority Invertebrate Species");
addTsToMus(["NSW South Coast Bushfires"], nswSouthCoastPriorityPlants, "Priority Plants");
addTsToMus(["NSW South Coast Bushfires"], nswSouthCoastAdditionalPriorityPlants, "Additional Priority Plants");

// South-East Queensland
let SEQNaturalAssets = ["Gondwana Rainforests of Australia World Heritage Area", "Moreton Bay Ramsar Wetland"];
let SEQAdditionalNaturalAssets = ["Great Sandy National Park"];
let SEQLDTEC = ["Lowland Rainforest of Subtropical Australia", "White Box-Yellow Box-Blakely's Red Gum Grassy Woodland and Derived Native Grassland"];
let seqPriorityVertebrateAnimals = [
    "Pseudomugil mellis (Honey Blue-eye)",
    "Nannoperca oxleyana (Oxleyan Pygmy Perch)",
    "Mixophyes fleayi (Fleay's Frog)",
    "Mordacia praecox (Non-parasitic Lamprey)",
    "Harrisoniascincus zia (Rainforest Cool-skink)",
    "Coeranoscincus reticulatus (Three-toed Snake-tooth Skink)",
    "Menura alberti (Albert's Lyrebird)",
    "Pseudomys oralis (Hastings River Mouse, Koontoo)",
    "Atrichornis rufescens (Rufous Scrub-bird)",
    "Philoria kundagungan (Mountain Frog)",
    "Petrogale penicillata (Brush-tailed Rock-wallaby)",
    "Dasyurus maculatus (Spot-tailed Quoll, Spotted-tail Quoll, Tiger Quoll)",
    "Pseudomys novaehollandiae (New Holland Mouse, Pookila)",
    "Anthochaera phrygia (Regent Honeyeater)",
    "Calyptorhynchus lathami (Glossy Black-Cockatoo (eastern))",
    "Monarcha melanopsis (Black-faced Monarch)",
    "Phascolarctos cinereus (Koala)",
    "Petaurus australis (Yellow-bellied Glider)",
    "Phoniscus papuensis (Golden-tipped Bat)",
    "Pteropus poliocephalus (Grey-headed Flying-fox)",
    "Ornithorhynchus anatinus (Platypus)",
    "Potorous tridactylus (Long-nosed Potoroo)",
    "Petauroides volans (Greater Glider)",
    "Pezoporus wallicus (Eastern Ground Parrot)",
    "Mixophyes iteratus (Giant Barred Frog)",
    "Dasyornis brachypterus (Eastern Bristlebird)",
    "Climacteris erythrops (Red-browed Treecreeper)",
    "Antechinus mimetes (Dusky Antechinus)",
    "Notamacropus parma (Parma Wallaby)"
];
let seqAdditionalPrioritySpecies = [
    "Pezoporus wallicus (ground parrot)",
    "Stipiturus malachurus (southern emu-wren)",
    "Crinia tinnula (wallum froglet)",
    "Litoria freycineti (wallum rocketfrog)",
    "Philoria kundagungan (red-and-yellow mountain frog)"
];
let seqPriorityInvertebrateSpecies = [
    "Euastacus jagara (Freshwater crayfish)",
    "Australatya striolata (Eastern Freshwater Shrimp)",
    "Caliagrion Billinghursti (Large Riverdamsel)",
    "Asteron grayi (A spider)",
    "Molycria mammosa (A spider)"
];
let seqPriorityPlants = [
    "Bertya ernestiana (Mt Barney bertya-shrub)",
    "Philotheca obovatifolia (Mountain Wax-flower)",
    "Zieria montana (Mountain Zieria)",
    "Grevillea linsmithii (Linsmith's Grevillea)",
    "Euphrasia bella (Lamington Eyebright, Mt Merino Eyebright)",
    "Prostanthera caerulea",
    "Prostanthera palustris (Swamp Mint-bush)",
    "Acacia trinervata (Three-nerved Wattle)"
];
var seqAdditionalPriorityPlants = [
    "Blandfordia grandiflora (Christmas bells)",
    "Brachyscome ascendens (Binna Burra daisy)",
    "Bulbophyllum weinthalii subsp. weinthalii (wax orchid)",
    "Eucalyptus codonocarpa (mallee ash)",
    "Eucalyptus dunni (Dunn's white gum)",
    "Gonocarpus hirtus",
    "Leptospermum barneyense",
    "Pimelea umbratica",
    "Pseudanthus pauciflorus subsp. pauciflorus",
    "Tetramolopium vagans",
    "Zieria montana"
];

addTsToMus(["South-East Queensland Bushfires"],SEQNaturalAssets, "Priority Natural Asset");
addTsToMus(["South-East Queensland Bushfires"], SEQAdditionalNaturalAssets, "Additional Priority Natural Asset");
addTsToMus(["South-East Queensland Bushfires"], SEQLDTEC, "Threatened Ecological Community");
addTsToMus(["South-East Queensland Bushfires"], seqPriorityVertebrateAnimals, "Priority Vertebrate Animals");
addTsToMus(["South-East Queensland Bushfires"], seqAdditionalPrioritySpecies, "Additional Priority Species");
addTsToMus(["South-East Queensland Bushfires"], seqPriorityInvertebrateSpecies, "Priority Invertebrate Species");
addTsToMus(["South-East Queensland Bushfires"], seqPriorityPlants, "Priority Plants");
addTsToMus(["South-East Queensland Bushfires"], seqAdditionalPriorityPlants, "Additional Priority Plants");



// Loading to RLP Mu's
addTsToMus(["Riverina"], alpineTEC, "Threatened Ecological Community");
addTsToMus(["Riverina"], alpineVertebrateAnimals, "Priority Vertebrate Animals");
addTsToMus(["Riverina"], alpineAdditionalPrioritySpecies, "Additional Priority Species");
addTsToMus(["Riverina"], alpineInvertebrateSpecies, "Priority Invertebrate Species");
addTsToMus(["Riverina"], alpinePriorityPlants, "Priority Plants");
addTsToMus(["Riverina"], alpineAdditionalPlants, "Additional Priority Plants");

addTsToMus(["South East NSW"], alpineTEC, "Threatened Ecological Community");
addTsToMus(["South East NSW"], alpineVertebrateAnimals, "Priority Vertebrate Animals");
addTsToMus(["South East NSW"], alpineAdditionalPrioritySpecies, "Additional Priority Species");
addTsToMus(["South East NSW"], alpineInvertebrateSpecies, "Priority Invertebrate Species");
addTsToMus(["South East NSW"], alpinePriorityPlants, "Priority Plants");
addTsToMus(["South East NSW"], alpineAdditionalPlants, "Additional Priority Plants");

addTsToMus(["ACT"], alpineTEC, "Threatened Ecological Community");
addTsToMus(["ACT"], alpineVertebrateAnimals, "Priority Vertebrate Animals");
addTsToMus(["ACT"], alpineAdditionalPrioritySpecies, "Additional Priority Species");
addTsToMus(["ACT"], alpineInvertebrateSpecies, "Priority Invertebrate Species");
addTsToMus(["ACT"], alpinePriorityPlants, "Priority Plants");
addTsToMus(["ACT"], alpineAdditionalPlants, "Additional Priority Plants");

addTsToMus(["Murray"], alpineTEC, "Threatened Ecological Community");
addTsToMus(["Murray"], alpineVertebrateAnimals, "Priority Vertebrate Animals");
addTsToMus(["Murray"], alpineAdditionalPrioritySpecies, "Additional Priority Species");
addTsToMus(["Murray"], alpineInvertebrateSpecies, "Priority Invertebrate Species");
addTsToMus(["Murray"], alpinePriorityPlants, "Priority Plants");
addTsToMus(["Murray"], alpineAdditionalPlants, "Additional Priority Plants");

addTsToMus(["North East"], alpineTEC, "Threatened Ecological Community");
addTsToMus(["North East"], alpineVertebrateAnimals, "Priority Vertebrate Animals");
addTsToMus(["North East"], alpineAdditionalPrioritySpecies, "Additional Priority Species");
addTsToMus(["North East"], alpineInvertebrateSpecies, "Priority Invertebrate Species");
addTsToMus(["North East"], alpinePriorityPlants, "Priority Plants");
addTsToMus(["North East"], alpineAdditionalPlants, "Additional Priority Plants");

addTsToMus(["Hunter"],greaterPriorityNaturalAsset, "Priority Natural Asset");
addTsToMus(["Hunter"], greaterTEC, "Threatened Ecological Community");
addTsToMus(["Hunter"], greaterPriorityVertebrateAnimals, "Priority Vertebrate Animals");
addTsToMus(["Hunter"], greaterAdditionalPrioritySpecies, "Additional Priority Species");
addTsToMus(["Hunter"], greaterInvertebrateSpecies, "Priority Invertebrate Species");
addTsToMus(["Hunter"], greaterPriorityPlants, "Priority Plants");
addTsToMus(["Hunter"], greaterAdditionalPlants, "Additional Priority Plants");

addTsToMus(["Central Tablelands"],greaterPriorityNaturalAsset, "Priority Natural Asset");
addTsToMus(["Central Tablelands"], greaterTEC, "Threatened Ecological Community");
addTsToMus(["Central Tablelands"], greaterPriorityVertebrateAnimals, "Priority Vertebrate Animals");
addTsToMus(["Central Tablelands"], greaterAdditionalPrioritySpecies, "Additional Priority Species");
addTsToMus(["Central Tablelands"], greaterInvertebrateSpecies, "Priority Invertebrate Species");
addTsToMus(["Central Tablelands"], greaterPriorityPlants, "Priority Plants");
addTsToMus(["Central Tablelands"], greaterAdditionalPlants, "Additional Priority Plants");

addTsToMus(["Greater Sydney"],greaterPriorityNaturalAsset, "Priority Natural Asset");
addTsToMus(["Greater Sydney"], greaterTEC, "Threatened Ecological Community");
addTsToMus(["Greater Sydney"], greaterPriorityVertebrateAnimals, "Priority Vertebrate Animals");
addTsToMus(["Greater Sydney"], greaterAdditionalPrioritySpecies, "Additional Priority Species");
addTsToMus(["Greater Sydney"], greaterInvertebrateSpecies, "Priority Invertebrate Species");
addTsToMus(["Greater Sydney"], greaterPriorityPlants, "Priority Plants");
addTsToMus(["Greater Sydney"], greaterAdditionalPlants, "Additional Priority Plants");

addTsToMus(["East Gippsland"], eastGippslandPriorityVertebrateAnimals, "Priority Vertebrate Animals");
addTsToMus(["East Gippsland"], eastGippslandAdditionalPrioritySpecies, "Additional Priority Species");
addTsToMus(["East Gippsland"], eastGippslandInVertebrateSpecies, "Priority Invertebrate Species");
addTsToMus(["East Gippsland"], eastGippslandPriorityPlants, "Priority Plants");
addTsToMus(["East Gippsland"], eastGippslandAdditionalPlants, "Additional Priority Plants");

addTsToMus(["Kangaroo Island"], kangarooPriorityVertebrateAnimals, "Priority Vertebrate Animals");
addTsToMus(["Kangaroo Island"], kangarooPriorityInvertebrateSpecies, "Priority Invertebrate Species");
addTsToMus(["Kangaroo Island"], kangarooPriorityPlants, "Priority Plants");

addTsToMus(["North Coast"],nswNorthPriorityNaturalAsset, "Priority Natural Asset");
addTsToMus(["North Coast"], northCoastAndTableLandsTEC, "Threatened Ecological Community");
addTsToMus(["North Coast"], nswNorthPriorityVertebrateAnimals, "Priority Vertebrate Animals");
addTsToMus(["North Coast"], nswNorthAdditionalPrioritySpecies, "Additional Priority Species");
addTsToMus(["North Coast"], nswNorthPriorityInvertebrateSpecies, "Priority Invertebrate Species");
addTsToMus(["North Coast"], nswNorthPriorityPlants, "Priority Plants");
addTsToMus(["North Coast"], nswNorthAdditionalPriorityPlants, "Additional Priority Plants");

addTsToMus(["Northern Tablelands"],nswNorthPriorityNaturalAsset, "Priority Natural Asset");
addTsToMus(["Northern Tablelands"], northCoastAndTableLandsTEC, "Threatened Ecological Community");
addTsToMus(["Northern Tablelands"], nswNorthPriorityVertebrateAnimals, "Priority Vertebrate Animals");
addTsToMus(["Northern Tablelands"], nswNorthAdditionalPrioritySpecies, "Additional Priority Species");
addTsToMus(["Northern Tablelands"], nswNorthPriorityInvertebrateSpecies, "Priority Invertebrate Species");
addTsToMus(["Northern Tablelands"], nswNorthPriorityPlants, "Priority Plants");
addTsToMus(["Northern Tablelands"], nswNorthAdditionalPriorityPlants, "Additional Priority Plants");

addTsToMus(["South East Queensland"],SEQNaturalAssets, "Priority Natural Asset");
addTsToMus(["South East Queensland"], SEQAdditionalNaturalAssets, "Additional Priority Natural Asset");
addTsToMus(["South East Queensland"], SEQLDTEC, "Threatened Ecological Community");
addTsToMus(["South East Queensland"], seqPriorityVertebrateAnimals, "Priority Vertebrate Animals");
addTsToMus(["South East Queensland"], seqAdditionalPrioritySpecies, "Additional Priority Species");
addTsToMus(["South East Queensland"], seqPriorityInvertebrateSpecies, "Priority Invertebrate Species");
addTsToMus(["South East Queensland"], seqPriorityPlants, "Priority Plants");
addTsToMus(["South East Queensland"], seqAdditionalPriorityPlants, "Additional Priority Plants");
