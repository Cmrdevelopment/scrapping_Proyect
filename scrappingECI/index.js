import fs from "fs";
import inquirer from "inquirer";
import puppeteer from "puppeteer";

/// tenemos que meter una variable global para meter una palabra que vamos a buscar en la pagina game

const scrapping = async (keyWord) => {
  const BASE_URL = "https://www.elcorteingles.es/";

  /// pomemos que el navegador se maximice
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: null,
    args: ["--start-maximized"],
  });

  const page = await browser.newPage();

  await page.goto(BASE_URL);

  // DARLE CLICK AL INPUT DE  de busqueda
  await page.click("#main_search");
  // Le metemos un valor al input y le presiono a Enter
  await page.type("#main_search", keyWord);
  await page.keyboard.press("Enter");

  // esperamos 8segundos
  await page.waitForTimeout(8000);
  //Baje hasta el fondo pillando el elemento a donde queremos viajar
  await page.evaluate(() => {
    const element = document.getElementById("footer-wrp_links");
    const y = element.getBoundingClientRect().top + window.pageYOffset;
    window.scrollTo({ top: y });
  });
  await page.waitForTimeout(6000);

  //! Ahora guardamos los datos de los nodos

  const items = await page.$$eval(
    "div.js_product_preview product_preview js-wish   _on_sale js_has_bazaar_voice  c12",
    (nodes) =>
      nodes.map((n) => ({
        title: n.querySelector(".product_preview-desc")?.innerText,
        image: n.querySelector(".js_preview_image")?.src,
        price: n.querySelector(".price _big _sale")?.innerText,
      }))
  );

  items.pop();

  await browser.close();

  const dataString = JSON.stringify(items);

  fs.writeFile(
    `${keyWord.replace(" ", "").toLowerCase()}.json`,
    dataString,
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
