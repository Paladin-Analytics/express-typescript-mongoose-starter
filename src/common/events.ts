export function PublishEvent(name: string, payload: any) {
    return new Promise((resolve) => {
        console.log(`Event Published: ${JSON.stringify({ name, payload })}`);
        resolve(true);
    });
}