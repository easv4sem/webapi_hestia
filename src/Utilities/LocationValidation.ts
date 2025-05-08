export class LocationValidation {
    public static isValidLongitude(longitude: number): boolean {
        return (longitude >= -180 && longitude <= 180);
    }

    public static isValidLatitude(latitude: number): boolean {
        return (latitude >= -90 && latitude <= 90);
    }
}