# Test Medications for SafeMed Scanner

Use these medications to test the accuracy of the AI analysis system. You can scan the barcodes or enter them manually.

## Common Over-the-Counter Medications

### 1. Panadol (Paracetamol/Acetaminophen)
- **Barcode**: `6168686102549` (you already tested this)
- **Active Ingredient**: Paracetamol (Acetaminophen)
- **Turkish Equivalent**: Parol, Tylol, Minoset
- **Expected Result**: Should identify as Paracetamol and find Turkish equivalents like Parol

### 2. Aspirin (Bayer)
- **Barcode**: `4005808221509` (Bayer Aspirin 100mg)
- **Active Ingredient**: Acetylsalicylic Acid
- **Turkish Equivalent**: Aspirin, Coraspin, Ecopirin
- **Expected Result**: Should identify Aspirin and find Turkish equivalents

### 3. Ibuprofen (Advil/Nurofen)
- **Barcode**: `5051882010045` (Nurofen 200mg)
- **Active Ingredient**: Ibuprofen
- **Turkish Equivalent**: Brufen, İbufen, Dolven
- **Expected Result**: Should identify Ibuprofen and find Turkish equivalents

### 4. Tylenol (Paracetamol)
- **Barcode**: `300450123456` (Tylenol 500mg)
- **Active Ingredient**: Paracetamol
- **Turkish Equivalent**: Parol, Tylol
- **Expected Result**: Should identify as Paracetamol

## Prescription Medications

### 5. Amoxicillin (Antibiotic)
- **Barcode**: `8699874556677` (Amoxicillin 500mg)
- **Active Ingredient**: Amoxicillin
- **Turkish Equivalent**: Amoklavin, Amoksiklav, Klavunat
- **Expected Result**: Should identify as antibiotic and find Turkish equivalents

### 6. Metformin (Diabetes)
- **Barcode**: `8699874556678` (Metformin 500mg)
- **Active Ingredient**: Metformin HCl
- **Turkish Equivalent**: Glucophage, Glifor, Diabamin
- **Expected Result**: Should identify as diabetes medication

### 7. Atorvastatin (Cholesterol)
- **Barcode**: `8699874556679` (Atorvastatin 20mg)
- **Active Ingredient**: Atorvastatin Calcium
- **Turkish Equivalent**: Ator, Lipitor, Atorlip
- **Expected Result**: Should identify as cholesterol medication

## Cold & Flu Medications

### 8. Coldrex (Cold & Flu)
- **Barcode**: `8699874556680`
- **Active Ingredients**: Paracetamol, Pseudoephedrine, Ascorbic Acid
- **Turkish Equivalent**: Theraflu, Gripex, Coldrex
- **Expected Result**: Should identify combination cold medication

### 9. Strepsils (Throat Lozenges)
- **Barcode**: `5051882010046`
- **Active Ingredient**: Amylmetacresol, Dichlorobenzyl Alcohol
- **Turkish Equivalent**: Strepsils, Tantum Verde
- **Expected Result**: Should identify as throat lozenges

## Vitamins & Supplements

### 10. Vitamin D3
- **Barcode**: `8699874556681`
- **Active Ingredient**: Cholecalciferol (Vitamin D3)
- **Turkish Equivalent**: D-Vit, Devit-3, D-Vitamin
- **Expected Result**: Should identify as vitamin supplement

## Testing Tips

1. **Start with well-known medications** like Panadol, Aspirin, or Ibuprofen
2. **Check if Turkish equivalents are found** - this is the main feature
3. **Verify active ingredients** are correctly identified
4. **Check pricing information** if provided (SGK and pharmacy prices)
5. **Verify prescription type** (Yeşil, Kırmızı, Mor, Turuncu)

## What to Look For

✅ **Good Results Should Include:**
- Correct medication name identification
- Accurate active ingredients
- Turkish equivalent medications found
- Similarity scores for matches
- Pricing information (if available)
- Prescription type classification

❌ **Issues to Report:**
- Wrong medication identified
- Missing Turkish equivalents
- Incorrect active ingredients
- No results found for common medications

## Notes

- Some barcodes above are examples/placeholders. Real barcodes may vary by manufacturer and region
- The AI should be able to identify medications even if the exact barcode isn't in a database
- Turkish equivalents are the key feature - make sure these are being found accurately
- If a barcode doesn't work, try entering the medication name manually in the AI prompt

