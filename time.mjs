/**
 * [version of ISO8601]{@link https://262.ecma-international.org/5.1/#sec-15.9.1.15}
 * 示例:time("yyyy-MM-dd qq HH:mm:ss.S") YYYY-MM-DDTHH:mm:ss.sssZ
 *    :time("yyyyMMddHHmmssS")
 *    YY:年 MM:月 DD:日 S:季 HH:时 m:分 ss:秒 sss:毫秒 Z:时区
 *    其中y可选0-4位占位符、S可选0-1位占位符，其余可选0-2位占位符
 * @param {string} format 格式化参数
 * @param {number} ts 可选: 根据指定时间戳返回格式化日期
 *
 */
export default function time(format, ts = null) {
    const date = ts ? new Date(ts) : new Date()
    let o = {
        "MM": date.getMonth() + 1,
        "DD": date.getDate(),
        "HH": date.getHours(),
        "mm": date.getMinutes(),
        "ss": date.getSeconds(),
        "S": Math.floor((date.getMonth()) / 3) + 1,
        "sss": date.getMilliseconds()
    }
    if (/(YY)/.test(format))
        format = format.replace(
            RegExp.$1,
            (date.getFullYear() + "").substr(4 - RegExp.$1.length)
        )
    for (let k in o)
        if (new RegExp("(" + k + ")").test(format))
            format = format.replace(
                RegExp.$1,
                RegExp.$1.length == 1
                    ? o[k]
                    : ("00" + o[k]).substr(("" + o[k]).length)
            )
    return format
};
