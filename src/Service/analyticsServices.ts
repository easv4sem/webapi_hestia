//import {validateNumberArray} from "../Utilities/validateData.js";
//Validation disabled as Jest doesn't like .js, Node.js requires it. Solution unknown.. Maybe re-enable validation after DevOps exam.

export class AnalyticsServices {

    sum(numbers: number[]): number {
        //validateNumberArray(numbers)

        return numbers.reduce((acc, val) => acc + val, 0);
    }

    average(numbers: number[]): number {
        //validateNumberArray(numbers)

        return this.sum(numbers) / numbers.length;
    }

    min(numbers: number[]): number {
        //validateNumberArray(numbers)

        return Math.min(...numbers);
    }

    max(numbers: number[]): number {
        //validateNumberArray(numbers)

        return Math.max(...numbers);
    }

    count(numbers: number[]): number {
        //validateNumberArray(numbers)

        return numbers.length;
    }
}

