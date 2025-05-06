import { AnalyticsServices } from "../src/Service/analyticsServices";
import {before} from "node:test";

describe('AnalyticsServices', () => {
    let analyticsService = new AnalyticsServices();

    before(() => {
        analyticsService = new AnalyticsServices();
    })

    describe('sum', () => {
        it('should return the sum of an array of numbers', () => {
            expect(analyticsService.sum([1, 2, 3, 4])).toBe(10);
        })
    })

    describe('average', () => {
        it('should return the average of an array of numbers', () => {
            expect(analyticsService.average([1, 2, 3, 4])).toBe(2.5);
        })
    })

    describe('min', () => {
        it('should return the minimum value of an array of numbers', () => {
            expect(analyticsService.min([1, 2, 3, 4])).toBe(1);
        })
    })

    describe('max', () => {
        it('should return the maximum value of an array of numbers', () => {
            expect(analyticsService.max([1, 2, 3, 4])).toBe(4);
        })
    })

    describe('count', () => {
        it('should return the count of an array of numbers', () => {
            expect(analyticsService.count([1, 2, 3, 4])).toBe(4);
        })
    })

})