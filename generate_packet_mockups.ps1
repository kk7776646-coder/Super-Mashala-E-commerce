Add-Type -AssemblyName System.Drawing

$baseDir = "C:\Users\KALAMUDDIN\.gemini\antigravity\scratch\super-mashala\frontend\public\assets\products"

$products = @(
    @{
        Category = "masala-powder"
        Slug = "garam-masala"
        Name = "Garam Masala"
        LabelText = "GARAM MASALA"
        Pieces = 10
        Texture = "$baseDir\masala-powder\garam-masala.jpg"
    },
    @{
        Category = "masala-powder"
        Slug = "sabji-masala"
        Name = "Sabji Masala"
        LabelText = "SABJI MASALA"
        Pieces = 10
        Texture = "$baseDir\masala-powder\sabji-masala.jpg"
    },
    @{
        Category = "whole-spices"
        Slug = "kafur"
        Name = "Kafur"
        LabelText = "KAFUR"
        Pieces = 12
        Texture = "$baseDir\whole-spices\kafur.jpg"
    },
    @{
        Category = "whole-spices"
        Slug = "rai"
        Name = "Rai"
        LabelText = "RAI"
        Pieces = 12
        Texture = "$baseDir\whole-spices\rai.jpg"
    },
    @{
        Category = "whole-spices"
        Slug = "jira"
        Name = "Jira (Jeera)"
        LabelText = "JIRA (JEERA)"
        Pieces = 12
        Texture = "$baseDir\whole-spices\jira.jpg"
    },
    @{
        Category = "whole-spices"
        Slug = "methi"
        Name = "Methi"
        LabelText = "METHI"
        Pieces = 12
        Texture = "$baseDir\whole-spices\methi.jpg"
    },
    @{
        Category = "whole-spices"
        Slug = "saunf"
        Name = "Saunf (Souf)"
        LabelText = "SAUNF (SOUF)"
        Pieces = 12
        Texture = "$baseDir\whole-spices\saunf.jpg"
    },
    @{
        Category = "whole-spices"
        Slug = "ajwain"
        Name = "Ajwain"
        LabelText = "AJWAIN"
        Pieces = 12
        Texture = "$baseDir\whole-spices\ajwain.jpg"
    },
    @{
        Category = "whole-spices"
        Slug = "panchforan"
        Name = "Panchforan"
        LabelText = "PANCHFORAN"
        Pieces = 12
        Texture = "$baseDir\whole-spices\panchforan.jpg"
    },
    @{
        Category = "whole-spices"
        Slug = "tej-patta"
        Name = "Tej Patta"
        LabelText = "TEJ PATTA"
        Pieces = 12
        Texture = "$baseDir\whole-spices\tej-patta.jpg"
    },
    @{
        Category = "whole-spices"
        Slug = "kali-mirch"
        Name = "Kali Mirch"
        LabelText = "KALI MIRCH"
        Pieces = 12
        Texture = "$baseDir\whole-spices\kali-mirch.jpg"
    },
    @{
        Category = "whole-spices"
        Slug = "laung"
        Name = "Laung"
        LabelText = "LAUNG"
        Pieces = 12
        Texture = "$baseDir\whole-spices\laung.jpg"
    },
    @{
        Category = "premium-spices"
        Slug = "elaichi"
        Name = "Elaichi"
        LabelText = "ELAICHI"
        Pieces = 12
        Texture = "$baseDir\premium-spices\elaichi.jpg"
    },
    @{
        Category = "premium-spices"
        Slug = "khas-khas"
        Name = "Khas Khas"
        LabelText = "KHAS KHAS"
        Pieces = 12
        Texture = "$baseDir\premium-spices\khas-khas.jpg"
    },
    @{
        Category = "premium-spices"
        Slug = "badi-elaichi"
        Name = "Badi Elaichi"
        LabelText = "BADI ELAICHI"
        Pieces = 12
        Texture = "$baseDir\premium-spices\badi-elaichi.jpg"
    }
)

function Create-PacketMockup($item) {
    $canvasW = 600
    $canvasH = 1100

    $bmp = New-Object System.Drawing.Bitmap($canvasW, $canvasH, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAliasGridFit
    $g.Clear([System.Drawing.ColorTranslator]::FromHtml("#FDFBF7"))

    # Subtle Studio Background Gradient
    $bgBrush = New-Object System.Drawing.Drawing2D.LinearGradientBrush(
        (New-Object System.Drawing.PointF(0, 0)),
        (New-Object System.Drawing.PointF(0, $canvasH)),
        [System.Drawing.ColorTranslator]::FromHtml("#FAF5EB"),
        [System.Drawing.ColorTranslator]::FromHtml("#F0EAE1")
    )
    $g.FillRectangle($bgBrush, 0, 0, $canvasW, $canvasH)
    $bgBrush.Dispose()

    # Load spice texture image
    $textureBmp = $null
    if (Test-Path $item.Texture) {
        $textureBmp = [System.Drawing.Image]::FromFile($item.Texture)
    }

    # Packet Strip Dimensions
    $stripW = 280
    $stripX = ($canvasW - $stripW) / 2
    $headerH = 135
    $startY = 50
    $numPouches = $item.Pieces
    $totalPouchesH = 860
    $pouchH = $totalPouchesH / $numPouches

    # Drop Shadow for Hanging Strip
    $shadowBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(35, 0, 0, 0))
    $g.FillRectangle($shadowBrush, ($stripX - 6), ($startY + 8), ($stripW + 12), ($headerH + $totalPouchesH + 10))
    $shadowBrush.Dispose()

    # 1. TOP CARDBOARD HEADER (White tag matching user's photo)
    $cardBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(250, 250, 252))
    $cardBorderPen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(210, 210, 215), 1.5)

    $headerRect = New-Object System.Drawing.RectangleF($stripX, $startY, $stripW, $headerH)
    $g.FillRectangle($cardBrush, $headerRect)
    $g.DrawRectangle($cardBorderPen, $stripX, $startY, $stripW, $headerH)

    # Top punch hole slot for hanger
    $holeBrush = New-Object System.Drawing.SolidBrush([System.Drawing.ColorTranslator]::FromHtml("#FAF5EB"))
    $holePen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(180, 180, 185), 1.2)
    $holeX = $canvasW / 2
    $holeY = $startY + 18
    $g.FillEllipse($holeBrush, ($holeX - 14), $holeY, 28, 14)
    $g.DrawEllipse($holePen, ($holeX - 14), $holeY, 28, 14)
    # Slot line above hole
    $g.DrawLine($holePen, $holeX, ($startY + 4), $holeX, $holeY)

    # Header Card Text (Matching exact user photo: "SUPER MASALA & DRY FRUITS ETC. M. 9527898176")
    $hdrFont1 = New-Object System.Drawing.Font("Arial Black", 13, [System.Drawing.FontStyle]::Bold)
    $hdrFont2 = New-Object System.Drawing.Font("Arial", 9, [System.Drawing.FontStyle]::Bold)
    $hdrFontPhone = New-Object System.Drawing.Font("Arial Black", 10, [System.Drawing.FontStyle]::Bold)
    $navyBrush = New-Object System.Drawing.SolidBrush([System.Drawing.ColorTranslator]::FromHtml("#1B365D"))
    $redBrush = New-Object System.Drawing.SolidBrush([System.Drawing.ColorTranslator]::FromHtml("#C01E1E"))

    $formatCenter = New-Object System.Drawing.StringFormat
    $formatCenter.Alignment = [System.Drawing.StringAlignment]::Center

    $g.DrawString("SUPER MASHALA", $hdrFont1, $redBrush, $holeX, ($startY + 42), $formatCenter)
    $g.DrawString("& DRY FRUITS", $hdrFont2, $navyBrush, $holeX, ($startY + 66), $formatCenter)
    $g.DrawString("WHOLESALE PACKET • 9527898176", $hdrFontPhone, $navyBrush, $holeX, ($startY + 86), $formatCenter)

    # Staple / attachment lines at bottom of header card
    $staplePen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(160, 160, 165), 2.5)
    $g.DrawLine($staplePen, ($stripX + 35), ($startY + $headerH - 8), ($stripX + 65), ($startY + $headerH - 8))
    $g.DrawLine($staplePen, ($stripX + $stripW - 65), ($startY + $headerH - 8), ($stripX + $stripW - 35), ($startY + $headerH - 8))

    # 2. CLEAR PLASTIC POUCHES (12 pouches stacked vertically)
    $polyBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(235, 255, 255, 255))
    $polyBorderPen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(190, 200, 210), 1.2)
    $crimpPen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(180, 185, 190), 1)
    $crimpPen.DashStyle = [System.Drawing.Drawing2D.DashStyle]::Dash

    $stripTopY = $startY + $headerH
    $g.FillRectangle($polyBrush, $stripX, $stripTopY, $stripW, $totalPouchesH)
    $g.DrawRectangle($polyBorderPen, $stripX, $stripTopY, $stripW, $totalPouchesH)

    for ($i = 0; $i -lt $numPouches; $i++) {
        $curY = $stripTopY + ($i * $pouchH)
        $pouchInnerX = $stripX + 10
        $pouchInnerW = $stripW - 20
        $pouchInnerH = $pouchH - 6
        $pouchInnerY = $curY + 3

        # Draw spice texture visible inside clear pouch
        if ($textureBmp -ne $null) {
            # Crop texture slice to fit pouch
            $srcH = $textureBmp.Height / $numPouches
            $srcY = $i * $srcH
            $srcRect = New-Object System.Drawing.RectangleF(0, $srcY, $textureBmp.Width, $srcH)
            $destRect = New-Object System.Drawing.RectangleF($pouchInnerX, $pouchInnerY, $pouchInnerW, $pouchInnerH)
            $g.DrawImage($textureBmp, $destRect, $srcRect, [System.Drawing.GraphicsUnit]::Pixel)
        }

        # Clear Plastic Sheen & Side Heat-Seal margins
        $sealMarginBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(90, 255, 255, 255))
        $g.FillRectangle($sealMarginBrush, $stripX, $curY, 10, $pouchH)
        $g.FillRectangle($sealMarginBrush, ($stripX + $stripW - 10), $curY, 10, $pouchH)
        $sealMarginBrush.Dispose()

        # Heat Seal Crimp Line between pouches
        $g.DrawLine($crimpPen, $stripX, $curY, ($stripX + $stripW), $curY)
        $g.DrawLine($crimpPen, $stripX, ($curY + 2), ($stripX + $stripW), ($curY + 2))

        # 3. RED BRAND LABEL STICKER (Matching exact user photo)
        $lblW = 160
        $lblH = [Math]::Min(36, ($pouchH - 12))
        $lblX = ($canvasW - $lblW) / 2
        $lblY = $curY + (($pouchH - $lblH) / 2)

        # Label drop shadow
        $lblShadow = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(60, 0, 0, 0))
        $g.FillRectangle($lblShadow, ($lblX + 2), ($lblY + 2), $lblW, $lblH)
        $lblShadow.Dispose()

        # Red label background
        $labelBgBrush = New-Object System.Drawing.SolidBrush([System.Drawing.ColorTranslator]::FromHtml("#D62222"))
        $labelBorderPen = New-Object System.Drawing.Pen([System.Drawing.Color]::White, 1.2)
        $g.FillRectangle($labelBgBrush, $lblX, $lblY, $lblW, $lblH)
        $g.DrawRectangle($labelBorderPen, $lblX, $lblY, $lblW, $lblH)
        $labelBgBrush.Dispose()
        $labelBorderPen.Dispose()

        # Text on red sticker
        $lblBrandFont = New-Object System.Drawing.Font("Arial Black", 8.5, [System.Drawing.FontStyle]::Bold)
        $lblProdFont = New-Object System.Drawing.Font("Arial Black", 8, [System.Drawing.FontStyle]::Bold)
        $whiteBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::White)
        $goldTextBrush = New-Object System.Drawing.SolidBrush([System.Drawing.ColorTranslator]::FromHtml("#FFF5A0"))

        $g.DrawString("SUPER MASHALA", $lblBrandFont, $whiteBrush, ($lblX + ($lblW / 2)), ($lblY + 3), $formatCenter)
        $g.DrawString($item.LabelText, $lblProdFont, $goldTextBrush, ($lblX + ($lblW / 2)), ($lblY + 17), $formatCenter)

        $lblBrandFont.Dispose()
        $lblProdFont.Dispose()
        $whiteBrush.Dispose()
        $goldTextBrush.Dispose()

        # Diagonal gloss reflection across pouch
        $shineBrush = New-Object System.Drawing.Drawing2D.LinearGradientBrush(
            (New-Object System.Drawing.PointF($stripX, $curY)),
            (New-Object System.Drawing.PointF(($stripX + $stripW), ($curY + $pouchH))),
            [System.Drawing.Color]::FromArgb(70, 255, 255, 255),
            [System.Drawing.Color]::FromArgb(0, 255, 255, 255)
        )
        $g.FillRectangle($shineBrush, $stripX, $curY, ($stripW / 2), $pouchH)
        $shineBrush.Dispose()
    }

    # Bottom Seal Line
    $bottomY = $stripTopY + $totalPouchesH
    $g.DrawLine($crimpPen, $stripX, $bottomY, ($stripX + $stripW), $bottomY)

    # Save PNG
    $destFolder = "$baseDir\$($item.Category)"
    if (!(Test-Path $destFolder)) {
        New-Item -ItemType Directory -Path $destFolder -Force | Out-Null
    }
    $outFile = "$destFolder\$($item.Slug).png"
    $bmp.Save($outFile, [System.Drawing.Imaging.ImageFormat]::Png)

    # Clean up
    if ($textureBmp -ne $null) { $textureBmp.Dispose() }
    $cardBrush.Dispose()
    $cardBorderPen.Dispose()
    $holeBrush.Dispose()
    $holePen.Dispose()
    $navyBrush.Dispose()
    $redBrush.Dispose()
    $staplePen.Dispose()
    $polyBrush.Dispose()
    $polyBorderPen.Dispose()
    $crimpPen.Dispose()
    $hdrFont1.Dispose()
    $hdrFont2.Dispose()
    $hdrFontPhone.Dispose()
    $formatCenter.Dispose()
    $g.Dispose()
    $bmp.Dispose()

    Write-Output "✓ Created packet mockup: $outFile"
}

foreach ($prod in $products) {
    Create-PacketMockup $prod
}

Write-Output "ALL 15 PACKET MOCKUPS CREATED SUCCESSFULLY!"
