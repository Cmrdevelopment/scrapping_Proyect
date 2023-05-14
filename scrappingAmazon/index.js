import fs from "fs";
import inquirer from "inquirer";
import puppeteer from "puppeteer";

const scrapping = async (keyWord) => {
  const BASE_URL = "https://www.amazon.es";

  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: null,
    args: ["--start-maximized"],
  });

  const page = await browser.newPage();

  await page.goto(BASE_URL);

  // DARLE CLICK AL INPUT DE  de busqueda
  await page.click("#twotabsearchtextbox");
  // Le metemos un valor al input y le presiono a Enter
  await page.type("#twotabsearchtextbox", keyWord);
  await page.keyboard.press("Enter");

  // esperamos 8segundos
  await page.waitForTimeout(8000);

  //Baje hasta el fondo pillando el elemento a donde queremos viajar
  await page.evaluate(() => {
    const element = document.getElementById("navFooter");
    const y = element.getBoundingClientRect().top + window.pageYOffset;
    window.scrollTo({ top: y });
  });
  await page.waitForTimeout(6000);

  //! Ahora guardamos los datos de los nodos

  const items = await page.$$eval("div.sg-col-inner", (nodes) =>
    nodes.map((n) => ({
      title: n.querySelector("span.a-size-base-plus a-color-base a-text-normal")
        ?.innerText,
      image: n.querySelector(".s-image")?.src,
      price: n.querySelector("span.a-price-whole")?.innerText,
    }))
  );

  items.pop();

  await browser.close();

  const datastring = JSON.stringify(items);

  fs.writeFile(
    `${keyWord.replace(" ", "").toLowerCase(items)}.json`,
    datastring,
    () => {
      console.log("Archivo escrito 👌");
    }
  );
};

inquirer
  .prompt([
    {
      name: "busqueda",
      message: "Que quieres buscar? ",
    },
  ])
  .then((answers) => {
    let keyWord = answers.busqueda;
    scrapping(keyWord);
  });
