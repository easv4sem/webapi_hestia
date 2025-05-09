
export default interface ITokenProvider {
    generateToken(payload: any): string;
    verifyToken(token: string): boolean;
    decodeToken(token: string): any;
}