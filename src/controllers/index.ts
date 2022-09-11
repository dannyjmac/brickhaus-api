import { asyncHandler } from "../middlewares/asyncHandlerFn";
import axios from "axios";
const ttl2jsonld = require("@frogcat/ttl2jsonld").parse;

export const previousSales = asyncHandler(async (req: any, res: any) => {
  try {
    const response = await axios.get(
      "https://landregistry.data.gov.uk/app/ppd/ppd_data.ttl?et%5B%5D=lrcommon%3Afreehold&et%5B%5D=lrcommon%3Aleasehold&limit=100&nb%5B%5D=true&nb%5B%5D=false&postcode=tn38&ptype%5B%5D=lrcommon%3Adetached&ptype%5B%5D=lrcommon%3Asemi-detached&ptype%5B%5D=lrcommon%3Aterraced&ptype%5B%5D=lrcommon%3Aflat-maisonette&ptype%5B%5D=lrcommon%3AotherPropertyType&tc%5B%5D=ppd%3AstandardPricePaidTransaction&tc%5B%5D=ppd%3AadditionalPricePaidTransaction"
    );
    const jsonld = ttl2jsonld(response.data);
    const filtered = jsonld["@graph"].filter((s: any) => !!s["ppd:pricePaid"]);
    const addresses = jsonld["@graph"].filter((s: any) => !s["ppd:pricePaid"]);
    const sales = filtered.map((sale: any, index: number) => {
      return {
        id: sale["@id"],
        date: sale["ppd:transactionDate"]?.["@value"]
          ? sale["ppd:transactionDate"]?.["@value"]
          : "-",
        price: sale["ppd:pricePaid"],
        newBuild: sale["ppd:newBuild"],
        address: {
          paon: addresses[index]["common:paon"],
          saon: addresses[index]["common:saon"],
          street: addresses[index]["common:street"],
          town: addresses[index]["common:town"],
          locality: addresses[index]["common:locality"],
          district: addresses[index]["common:district"],
          county: addresses[index]["common:county"],
          postcode: addresses[index]["common:postcode"],
        },
      };
    });

    res.status(200).json({
      success: true,
      data: sales,
    });
  } catch (err) {
    console.log({ err });
  }
});
