export const httpPost = (url: string) => (body: any) => {
    return fetch (url, {
        method: "POST",
        body: JSON.stringify(body),
    })
}