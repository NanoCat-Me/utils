import { $platform, log } from "./utils.mjs";
import pako from "pako";
/* https://grpc.io/ */
export default class GRPC {
    static name = "gRPC";
    static version = "1.0.3";
    static about = () => log("", `🟧 ${this.name} v${this.version}`, "");

    static decode(bytesBody = new Uint8Array([])) {
        log("☑️ gRPC.decode", "");
        // 先拆分gRPC校验头和protobuf数据体
        const Header = bytesBody.slice(0, 5);
        let body = bytesBody.slice(5);
        switch (Header[0]) {
            case 0: // unGzip
            default:
                break;
            case 1: // Gzip
                switch ($platform) {
                    case "Surge":
                        body = $utils.ungzip(body);
                        break;
                    default:
                        body = pako.ungzip(body); // 解压缩protobuf数据体
                        break;
                };
                Header[0] = 0; // unGzip
                break;
        };
        log("✅ gRPC.decode", "");
        return body;
    };

    static encode(body = new Uint8Array([]), encoding = "identity") {
        log("☑️ gRPC.encode", "");
        // Header: 1位：是否校验数据 （0或者1） + 4位:校验值（数据长度）
        const Header = new Uint8Array(5);
        const Checksum = GRPC.#Checksum(body.length); // 校验值为未压缩情况下的数据长度, 不是压缩后的长度
        Header.set(Checksum, 1) // 1-4位： 校验值(4位)
        switch (encoding) {
            case "gzip":
                Header.set([1], 0) // 0位：Encoding类型，当为1的时候, app会校验1-4位的校验值是否正确
                body = pako.gzip(body);
                break;
            case "identity":
            case undefined:
            default:
                Header.set([0], 0) // 0位：Encoding类型，当为1的时候, app会校验1-4位的校验值是否正确
                break;
        };
        const BytesBody = new Uint8Array(Header.length + body.length);
        BytesBody.set(Header, 0); // 0-4位：gRPC校验头
        BytesBody.set(body, 5); // 5-end位：protobuf数据
        log("✅ gRPC.encode", "");
        return BytesBody;
    };

	// 计算校验和 (B站为数据本体字节数)
	static #Checksum(num = 0) {
		const array = new ArrayBuffer(4); // an Int32 takes 4 bytes
		const view = new DataView(array);
		// 首位填充计算过的新数据长度
		view.setUint32(0, num, false); // byteOffset = 0; litteEndian = false
		return new Uint8Array(array);
	};
}
