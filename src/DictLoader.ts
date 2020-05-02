import pako from "pako";

const SpecialHeading1RegExp = new RegExp("^(.*) <(.*)>…$");
const SpecialHeading2RegExp = new RegExp("^(.*) <(.*)…$");
const BasicHeadingRegExp = new RegExp("^(.*) <(.*)>$");

export const loadDict = (): Promise<
  Array<{ heading: string; reading: string; text?: string }>
> =>
  fetch(`${process.env.PUBLIC_URL}/dic.json.gz`)
    .then((res) => res.blob())
    .then(
      (blob) =>
        new Promise<Uint8Array>((resolve) => {
          const fr = new FileReader();
          fr.readAsArrayBuffer(blob);
          fr.addEventListener("load", () => {
            resolve(new Uint8Array(fr.result as ArrayBuffer));
          });
        })
    )
    .then((ab) => JSON.parse(pako.ungzip(ab, { to: "string" })))
    .then((json) => {
      const entries: Array<{
        heading: string;
        text?: string;
      }> = json.subbooks[0].entries.filter((d: any) => d.heading);

      return entries.map((e) => {
        const specialMatch1 = SpecialHeading1RegExp.exec(e.heading);
        if (specialMatch1) {
          const heading = specialMatch1[1];
          const reading = specialMatch1[2];

          return {
            heading,
            reading,
            text: e.text,
          };
        }

        const specialMatch2 = SpecialHeading2RegExp.exec(e.heading);
        if (specialMatch2) {
          const heading = specialMatch2[1];
          const reading = specialMatch2[2];

          return {
            heading,
            reading,
            text: e.text,
          };
        }

        const basicMatch = BasicHeadingRegExp.exec(e.heading);
        if (basicMatch) {
          const heading = basicMatch[1];
          const reading = basicMatch[2];

          return {
            heading,
            reading,
            text: e.text,
          };
        }

        throw new Error(JSON.stringify(e, null, 2));
      });
    });
