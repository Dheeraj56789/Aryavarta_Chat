// Hierarchical Location Data: Country -> State -> Districts/Cities & Postal Codes

export const LOCATION_DATA = {
  India: {
    flag: "🇮🇳",
    code: "+91",
    states: {
      "Uttar Pradesh": {
        districts: [
          { name: "Lucknow", pincode: "226001" },
          { name: "Kanpur", pincode: "208001" },
          { name: "Varanasi", pincode: "221001" },
          { name: "Prayagraj (Allahabad)", pincode: "211001" },
          { name: "Noida / Gautam Buddha Nagar", pincode: "201301" },
          { name: "Ghaziabad", pincode: "201001" },
          { name: "Agra", pincode: "282001" },
          { name: "Meerut", pincode: "250001" },
          { name: "Bareilly", pincode: "243001" },
          { name: "Aligarh", pincode: "202001" },
          { name: "Gorakhpur", pincode: "273001" },
          { name: "Jhansi", pincode: "284001" },
          { name: "Mathura", pincode: "281001" },
          { name: "Ayodhya / Faizabad", pincode: "224001" },
          { name: "Moradabad", pincode: "244001" },
          { name: "Saharanpur", pincode: "247001" },
          { name: "Muzaffarnagar", pincode: "251001" }
        ]
      },
      "Maharashtra": {
        districts: [
          { name: "Mumbai City", pincode: "400001" },
          { name: "Mumbai Suburban", pincode: "400050" },
          { name: "Pune", pincode: "411001" },
          { name: "Nagpur", pincode: "440001" },
          { name: "Thane", pincode: "400601" },
          { name: "Nashik", pincode: "422001" },
          { name: "Chhatrapati Sambhajinagar (Aurangabad)", pincode: "431001" },
          { name: "Solapur", pincode: "413001" },
          { name: "Navi Mumbai", pincode: "400703" },
          { name: "Kolhapur", pincode: "416001" }
        ]
      },
      "Delhi (NCT)": {
        districts: [
          { name: "New Delhi", pincode: "110001" },
          { name: "Central Delhi", pincode: "110005" },
          { name: "South Delhi", pincode: "110017" },
          { name: "North Delhi", pincode: "110007" },
          { name: "West Delhi", pincode: "110027" },
          { name: "East Delhi", pincode: "110092" },
          { name: "Dwarka / South West Delhi", pincode: "110075" }
        ]
      },
      "Karnataka": {
        districts: [
          { name: "Bengaluru Urban", pincode: "560001" },
          { name: "Bengaluru Rural", pincode: "562123" },
          { name: "Mysuru", pincode: "570001" },
          { name: "Mangaluru (Dakshina Kannada)", pincode: "575001" },
          { name: "Hubballi-Dharwad", pincode: "580020" },
          { name: "Belagavi", pincode: "590001" }
        ]
      },
      "Tamil Nadu": {
        districts: [
          { name: "Chennai", pincode: "600001" },
          { name: "Coimbatore", pincode: "641001" },
          { name: "Madurai", pincode: "625001" },
          { name: "Tiruchirappalli", pincode: "620001" },
          { name: "Salem", pincode: "636001" }
        ]
      },
      "Gujarat": {
        districts: [
          { name: "Ahmedabad", pincode: "380001" },
          { name: "Surat", pincode: "395001" },
          { name: "Vadodara", pincode: "390001" },
          { name: "Rajkot", pincode: "360001" },
          { name: "Gandhinagar", pincode: "382010" }
        ]
      },
      "Rajasthan": {
        districts: [
          { name: "Jaipur", pincode: "302001" },
          { name: "Jodhpur", pincode: "342001" },
          { name: "Udaipur", pincode: "313001" },
          { name: "Kota", pincode: "324001" },
          { name: "Bikaner", pincode: "334001" },
          { name: "Ajmer", pincode: "305001" }
        ]
      },
      "West Bengal": {
        districts: [
          { name: "Kolkata", pincode: "700001" },
          { name: "Howrah", pincode: "711101" },
          { name: "North 24 Parganas", pincode: "700124" },
          { name: "South 24 Parganas", pincode: "700144" },
          { name: "Darjeeling", pincode: "734101" }
        ]
      },
      "Bihar": {
        districts: [
          { name: "Patna", pincode: "800001" },
          { name: "Gaya", pincode: "823001" },
          { name: "Muzaffarpur", pincode: "842001" },
          { name: "Bhagalpur", pincode: "812001" },
          { name: "Darbhanga", pincode: "846001" }
        ]
      },
      "Madhya Pradesh": {
        districts: [
          { name: "Bhopal", pincode: "462001" },
          { name: "Indore", pincode: "452001" },
          { name: "Gwalior", pincode: "474001" },
          { name: "Jabalpur", pincode: "482001" },
          { name: "Ujjain", pincode: "456001" }
        ]
      },
      "Telangana": {
        districts: [
          { name: "Hyderabad", pincode: "500001" },
          { name: "Warangal", pincode: "506001" },
          { name: "Nizamabad", pincode: "503001" },
          { name: "Karimnagar", pincode: "505001" }
        ]
      },
      "Kerala": {
        districts: [
          { name: "Thiruvananthapuram", pincode: "695001" },
          { name: "Kochi (Ernakulam)", pincode: "682001" },
          { name: "Kozhikode", pincode: "673001" },
          { name: "Thrissur", pincode: "680001" }
        ]
      },
      "Punjab": {
        districts: [
          { name: "Chandigarh / Mohali", pincode: "160001" },
          { name: "Ludhiana", pincode: "141001" },
          { name: "Amritsar", pincode: "143001" },
          { name: "Jalandhar", pincode: "144001" }
        ]
      },
      "Haryana": {
        districts: [
          { name: "Gurugram (Gurgaon)", pincode: "122001" },
          { name: "Faridabad", pincode: "121001" },
          { name: "Panipat", pincode: "132103" },
          { name: "Ambala", pincode: "134003" }
        ]
      }
    }
  },
  "United States": {
    flag: "🇺🇸",
    code: "+1",
    states: {
      "California": {
        districts: [
          { name: "Los Angeles", pincode: "90001" },
          { name: "San Francisco", pincode: "94102" },
          { name: "San Diego", pincode: "92101" },
          { name: "San Jose (Silicon Valley)", pincode: "95101" }
        ]
      },
      "New York": {
        districts: [
          { name: "New York City (Manhattan)", pincode: "10001" },
          { name: "Brooklyn", pincode: "11201" },
          { name: "Queens", pincode: "11351" },
          { name: "Buffalo", pincode: "14201" }
        ]
      },
      "Texas": {
        districts: [
          { name: "Houston", pincode: "77001" },
          { name: "Dallas", pincode: "75201" },
          { name: "Austin", pincode: "73301" },
          { name: "San Antonio", pincode: "78201" }
        ]
      },
      "Washington": {
        districts: [
          { name: "Seattle", pincode: "98101" },
          { name: "Bellevue", pincode: "98004" },
          { name: "Spokane", pincode: "99201" }
        ]
      }
    }
  },
  "United Kingdom": {
    flag: "🇬🇧",
    code: "+44",
    states: {
      "Greater London": {
        districts: [
          { name: "Central London", pincode: "EC1A 1BB" },
          { name: "Westminster", pincode: "SW1A 0AA" },
          { name: "Camden", pincode: "NW1 2DB" }
        ]
      },
      "West Midlands": {
        districts: [
          { name: "Birmingham", pincode: "B1 1AA" },
          { name: "Coventry", pincode: "CV1 1AA" }
        ]
      },
      "Greater Manchester": {
        districts: [
          { name: "Manchester City", pincode: "M1 1AD" },
          { name: "Salford", pincode: "M5 4WT" }
        ]
      },
      "Scotland": {
        districts: [
          { name: "Edinburgh", pincode: "EH1 1YZ" },
          { name: "Glasgow", pincode: "G1 1DA" }
        ]
      }
    }
  },
  "United Arab Emirates": {
    flag: "🇦🇪",
    code: "+971",
    states: {
      "Dubai": {
        districts: [
          { name: "Downtown Dubai", pincode: "00000" },
          { name: "Dubai Marina", pincode: "00000" },
          { name: "Deira", pincode: "00000" },
          { name: "Business Bay", pincode: "00000" }
        ]
      },
      "Abu Dhabi": {
        districts: [
          { name: "Abu Dhabi Central", pincode: "00000" },
          { name: "Al Ain", pincode: "00000" },
          { name: "Yas Island", pincode: "00000" }
        ]
      },
      "Sharjah": {
        districts: [
          { name: "Sharjah City", pincode: "00000" },
          { name: "Al Majaz", pincode: "00000" }
        ]
      }
    }
  },
  "Canada": {
    flag: "🇨🇦",
    code: "+1",
    states: {
      "Ontario": {
        districts: [
          { name: "Toronto", pincode: "M5H 2N2" },
          { name: "Ottawa", pincode: "K1P 1J1" },
          { name: "Mississauga", pincode: "L5B 1M3" }
        ]
      },
      "British Columbia": {
        districts: [
          { name: "Vancouver", pincode: "V6B 1A1" },
          { name: "Victoria", pincode: "V8W 1P6" },
          { name: "Surrey", pincode: "V3T 0A1" }
        ]
      },
      "Quebec": {
        districts: [
          { name: "Montreal", pincode: "H2Y 1C6" },
          { name: "Quebec City", pincode: "G1R 4P5" }
        ]
      }
    }
  },
  "Australia": {
    flag: "🇦🇺",
    code: "+61",
    states: {
      "New South Wales": {
        districts: [
          { name: "Sydney", pincode: "2000" },
          { name: "Parramatta", pincode: "2150" },
          { name: "Newcastle", pincode: "2300" }
        ]
      },
      "Victoria": {
        districts: [
          { name: "Melbourne", pincode: "3000" },
          { name: "Geelong", pincode: "3220" }
        ]
      },
      "Queensland": {
        districts: [
          { name: "Brisbane", pincode: "4000" },
          { name: "Gold Coast", pincode: "4217" }
        ]
      }
    }
  },
  "Singapore": {
    flag: "🇸🇬",
    code: "+65",
    states: {
      "Central Singapore": {
        districts: [
          { name: "Downtown Core", pincode: "018989" },
          { name: "Orchard", pincode: "238865" },
          { name: "Marina Bay", pincode: "018956" }
        ]
      },
      "Jurong / West": {
        districts: [
          { name: "Jurong East", pincode: "609602" },
          { name: "Clementi", pincode: "129588" }
        ]
      }
    }
  },
  "Germany": {
    flag: "🇩🇪",
    code: "+49",
    states: {
      "Bavaria": {
        districts: [
          { name: "Munich", pincode: "80331" },
          { name: "Nuremberg", pincode: "90403" }
        ]
      },
      "Berlin": {
        districts: [
          { name: "Mitte", pincode: "10115" },
          { name: "Charlottenburg", pincode: "10585" }
        ]
      },
      "North Rhine-Westphalia": {
        districts: [
          { name: "Cologne", pincode: "50667" },
          { name: "Düsseldorf", pincode: "40213" },
          { name: "Frankfurt", pincode: "60311" }
        ]
      }
    }
  }
};
