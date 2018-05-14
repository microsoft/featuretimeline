export function hexToRgb(hex: string, opacity: number) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    const rgb = result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;

    if (rgb) {
        const {
            r,
            g,
            b
        } = rgb;
        return `rgba(${r},${g},${b}, ${opacity})`;
    }
}
