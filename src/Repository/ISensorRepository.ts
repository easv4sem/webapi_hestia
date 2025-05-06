import * as QueryString from "node:querystring";

export interface ISensorRepository{

    // @ts-ignore
    readAllSensors(id: string | QueryString.ParsedQs | (string | QueryString.ParsedQs)[], range: string | QueryString.ParsedQs | (string | QueryString.ParsedQs)[]);


}