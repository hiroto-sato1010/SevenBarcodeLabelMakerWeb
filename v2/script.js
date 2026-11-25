const productNameLine1 =
    document.getElementById("productNameLine1");

const productNameLine2 =
    document.getElementById("productNameLine2");

const barcodeNumber =
    document.getElementById("barcodeNumber");

const preview =
    document.getElementById("preview");

const saveButton =
    document.getElementById("saveButton");

const imageInput =
    document.getElementById("imageInput");

const clearImageButton =
    document.getElementById("clearImageButton");


// =========================
// 選択中の画像（データURL）
// =========================

let selectedImageDataUrl = null;


// =========================
// 画像選択
// =========================

imageInput.addEventListener("change", () => {

    const file = imageInput.files[0];

    if (!file) {
        return;
    }

    const reader = new FileReader();

    reader.onload = () => {

        selectedImageDataUrl = reader.result;

        clearImageButton.style.display = "";

        updatePreview();
    };

    reader.readAsDataURL(file);
});


// =========================
// 画像削除
// =========================

clearImageButton.addEventListener("click", () => {

    selectedImageDataUrl = null;

    imageInput.value = "";

    clearImageButton.style.display = "none";

    updatePreview();
});


// =========================
// JANコード入力
// =========================

barcodeNumber.addEventListener("input", () => {

    barcodeNumber.value =
        barcodeNumber.value
            .replace(/\D/g, "")
            .slice(0, 13);

    updatePreview();
});


// =========================
// 商品名入力
// =========================

productNameLine1.addEventListener(
    "input",
    updatePreview
);

productNameLine2.addEventListener(
    "input",
    updatePreview
);


// =========================
// プレビュー更新
// =========================

function updatePreview() {

    const name1 =
        productNameLine1.value.trim();

    const name2 =
        productNameLine2.value.trim();

    const jan =
        barcodeNumber.value.trim();


    // すべて空欄
    if (!name1 && !name2 && !jan && !selectedImageDataUrl) {

        preview.innerHTML =
            "ここにラベルが表示されます";

        saveButton.disabled = true;

        return;
    }


    // JANが13桁なら保存可能
    saveButton.disabled =
        jan.length !== 13;


    // =========================
    // ラベルHTML
    // =========================

    preview.innerHTML = `
        <div class="label-preview">

            <div class="label-content">

                <div class="label-name line1">
                    ${escapeHtml(name1)}
                </div>

                ${
                    name2
                        ? `
                        <div class="label-name line2">
                            ${escapeHtml(name2)}
                        </div>
                        `
                        : ""
                }

                <svg
                    id="barcodePreview"
                    class="barcode-preview"
                ></svg>

                <div class="label-image-area${selectedImageDataUrl ? " has-image" : ""}">
                    ${
                        selectedImageDataUrl
                            ? `<img src="${selectedImageDataUrl}" alt="">`
                            : ""
                    }
                </div>

            </div>

        </div>
    `;


    // =========================
    // EAN-13生成
    // =========================

    if (jan.length === 13) {

        try {

            JsBarcode(
                "#barcodePreview",
                jan,
                {
                    format: "ean13",

                    width: 1.6,

                    height: 48,

                    displayValue: true,

                    fontSize: 14,

                    margin: 0
                }
            );

        } catch (error) {

            console.log(
                "EAN-13生成エラー:",
                error
            );
        }
    }
}


// =========================
// HTML特殊文字対策
// =========================

function escapeHtml(text) {

    return text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


// =====================================================
// A4横 PNG保存
// =====================================================

saveButton.addEventListener("click", async () => {

    const name1 =
        productNameLine1.value.trim();

    const name2 =
        productNameLine2.value.trim();

    const jan =
        barcodeNumber.value.trim();


    // =========================
    // JAN確認
    // =========================

    if (jan.length !== 13) {

        alert(
            "JANコードを13桁入力してください。"
        );

        return;
    }


    // =========================
    // html2canvas確認
    // =========================

    if (typeof html2canvas === "undefined") {

        alert(
            "PNG保存機能の読み込みに失敗しています。\n" +
            "index.htmlの設定を確認します。"
        );

        return;
    }


    // =================================================
    // 選択画像の読み込み完了を待つ（PNG化で欠けないように）
    // =================================================

    if (selectedImageDataUrl) {

        await new Promise(resolve => {

            const preload = new Image();

            preload.onload = resolve;
            preload.onerror = resolve;

            preload.src = selectedImageDataUrl;
        });
    }


    // =================================================
    // A4横サイズ
    // 1123 × 794 px
    // =================================================

    const A4_WIDTH = 1123;
    const A4_HEIGHT = 794;


    // =================================================
    // 42面
    // 7列 × 6行
    // =================================================

    const COLS = 7;
    const ROWS = 6;

    const LABEL_WIDTH =
        A4_WIDTH / COLS;

    const LABEL_HEIGHT =
        A4_HEIGHT / ROWS;


    // =================================================
    // A4シート作成
    // =================================================

    const sheet =
        document.createElement("div");

    sheet.style.position = "fixed";
    sheet.style.left = "-20000px";
    sheet.style.top = "0";

    sheet.style.width =
        `${A4_WIDTH}px`;

    sheet.style.height =
        `${A4_HEIGHT}px`;

    sheet.style.background =
        "#ffffff";

    sheet.style.display =
        "grid";

    sheet.style.gridTemplateColumns =
        `repeat(${COLS}, ${LABEL_WIDTH}px)`;

    sheet.style.gridTemplateRows =
        `repeat(${ROWS}, ${LABEL_HEIGHT}px)`;

    sheet.style.margin = "0";
    sheet.style.padding = "0";

    sheet.style.overflow = "hidden";


    // =================================================
    // 42枚作成
    // =================================================

    for (let i = 0; i < 42; i++) {

        // =========================
        // 1マス
        // =========================

        const label =
            document.createElement("div");

        label.style.width =
            `${LABEL_WIDTH}px`;

        label.style.height =
            `${LABEL_HEIGHT}px`;

        label.style.boxSizing =
            "border-box";

        label.style.background =
            "#ffffff";

        label.style.border =
            "1px solid #555";

        label.style.position =
            "relative";

        label.style.overflow =
            "hidden";


        // =========================
        // 内容全体
        // =========================

        const content =
            document.createElement("div");

        content.style.position =
            "absolute";

        content.style.left =
            "50%";

        content.style.top =
            "50%";

        content.style.transform =
            "translate(-50%, -50%)";

        content.style.width =
            `${LABEL_WIDTH - 10}px`;

        content.style.display =
            "flex";

        content.style.flexDirection =
            "column";

        content.style.alignItems =
            "center";

        content.style.justifyContent =
            "center";

        content.style.textAlign =
            "center";

        content.style.boxSizing =
            "border-box";


        // =================================================
        // 商品名1
        // =================================================

        const line1 =
            document.createElement("div");

        line1.textContent =
            name1;

        line1.style.width =
            "100%";

        line1.style.fontSize =
            "12px";

        line1.style.fontWeight =
            "700";

        line1.style.lineHeight =
            "1.12";

        line1.style.whiteSpace =
            "nowrap";

        line1.style.overflow =
            "hidden";

        line1.style.textOverflow =
            "ellipsis";

        line1.style.margin =
            "0";

        line1.style.padding =
            "0";


        content.appendChild(line1);


        // =================================================
        // 商品名2
        // =================================================

        if (name2) {

            const line2 =
                document.createElement("div");

            line2.textContent =
                name2;

            line2.style.width =
                "100%";

            line2.style.fontSize =
                "12px";

            line2.style.fontWeight =
                "700";

            line2.style.lineHeight =
                "1.12";

            line2.style.whiteSpace =
                "nowrap";

            line2.style.overflow =
                "hidden";

            line2.style.textOverflow =
                "ellipsis";

            line2.style.margin =
                "2px 0 0 0";

            line2.style.padding =
                "0";


            content.appendChild(line2);
        }


        // =================================================
        // バーコード
        // =================================================

        const barcode =
            document.createElementNS(
                "http://www.w3.org/2000/svg",
                "svg"
            );


        barcode.setAttribute(
            "xmlns",
            "http://www.w3.org/2000/svg"
        );


        barcode.style.display =
            "block";

        barcode.style.width =
            `${LABEL_WIDTH - 30}px`;

        barcode.style.height =
            "38px";

        barcode.style.margin =
            "4px auto 0";

        barcode.style.overflow =
            "visible";


        content.appendChild(barcode);


        // =================================================
        // 画像スペース（選択した画像を全ラベルに複製）
        // =================================================

        const imageArea =
            document.createElement("div");

        imageArea.style.width =
            `${LABEL_WIDTH - 16}px`;

        imageArea.style.height =
            "58px";

        imageArea.style.margin =
            "4px auto 0";

        imageArea.style.display =
            "flex";

        imageArea.style.alignItems =
            "center";

        imageArea.style.justifyContent =
            "center";

        imageArea.style.boxSizing =
            "border-box";


        if (selectedImageDataUrl) {

            const img =
                document.createElement("img");

            img.src =
                selectedImageDataUrl;

            img.style.maxWidth =
                "100%";

            img.style.maxHeight =
                "100%";

            img.style.objectFit =
                "contain";

            img.style.display =
                "block";

            imageArea.appendChild(img);
        }


        content.appendChild(imageArea);

        label.appendChild(content);

        sheet.appendChild(label);


        // =================================================
        // EAN-13
        // =================================================

        JsBarcode(
            barcode,
            jan,
            {
                format: "ean13",

                width: 1.35,

                height: 26,

                displayValue: true,

                fontSize: 9,

                margin: 0
            }
        );
    }


    // =================================================
    // 一時的に画面へ追加
    // =================================================

    document.body.appendChild(sheet);


    // =================================================
    // 描画待ち
    // =================================================

    await new Promise(resolve => {

        requestAnimationFrame(() => {

            requestAnimationFrame(() => {

                setTimeout(
                    resolve,
                    100
                );

            });

        });

    });


    // =================================================
    // PNG化
    // =================================================

    try {

        const canvas =
            await html2canvas(
                sheet,
                {
                    backgroundColor:
                        "#ffffff",

                    scale: 2,

                    width:
                        A4_WIDTH,

                    height:
                        A4_HEIGHT,

                    logging: false,

                    useCORS: false,

                    allowTaint: true
                }
            );


        // =================================================
        // ダウンロード
        // =================================================

const blob = await new Promise(resolve => {
    canvas.toBlob(resolve, "image/png");
});

if (!blob) {
    throw new Error("PNGデータの作成に失敗しました。");
}

const url = URL.createObjectURL(blob);

// iPhone / iPadの場合
const isIOS =
    /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);

if (isIOS) {
    // iPhoneでは画像を画面に表示して、
    // 長押しして写真へ保存できるようにする
    const overlay = document.createElement("div");

    overlay.style.position = "fixed";
    overlay.style.top = "0";
    overlay.style.left = "0";
    overlay.style.width = "100%";
    overlay.style.height = "100%";
    overlay.style.background = "rgba(0,0,0,0.95)";
    overlay.style.zIndex = "99999";
    overlay.style.display = "flex";
    overlay.style.flexDirection = "column";
    overlay.style.alignItems = "center";
    overlay.style.justifyContent = "center";
    overlay.style.padding = "20px";
    overlay.style.boxSizing = "border-box";

    const message = document.createElement("div");

    message.textContent =
        "画像を長押しして「写真に保存」してください";

    message.style.color = "#ffffff";
    message.style.fontSize = "18px";
    message.style.fontWeight = "bold";
    message.style.textAlign = "center";
    message.style.marginBottom = "15px";

    const image = document.createElement("img");

    image.src = url;
    image.style.maxWidth = "100%";
    image.style.maxHeight = "80vh";
    image.style.objectFit = "contain";
    image.style.background = "#ffffff";

    const closeButton = document.createElement("button");

    closeButton.textContent = "閉じる";
    closeButton.style.marginTop = "15px";
    closeButton.style.padding = "10px 25px";
    closeButton.style.fontSize = "16px";

    closeButton.addEventListener("click", () => {
        URL.revokeObjectURL(url);
        overlay.remove();
    });

    overlay.appendChild(message);
    overlay.appendChild(image);
    overlay.appendChild(closeButton);

    document.body.appendChild(overlay);

} else {
    // PCでは今まで通り自動ダウンロード
    const link = document.createElement("a");

    link.download = "SevenBarcodeLabel_A4横.png";
    link.href = url;

    document.body.appendChild(link);
    link.click();
    link.remove();

    setTimeout(() => {
        URL.revokeObjectURL(url);
    }, 1000);
}


    } catch (error) {

        console.error(
            "PNG保存エラー:",
            error
        );

        alert(
            "PNG保存に失敗しました。\n\n" +
            error.message
        );


    } finally {

        sheet.remove();
    }

});
