export function PublishEvent(name: string, payload: unknown): Promise<boolean>{
    return new Promise((resolve) => {
        console.log(`Event Published: ${JSON.stringify({ name, payload })}`);
        resolve(true);
    });
}