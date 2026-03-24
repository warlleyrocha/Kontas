import { slides } from "../constants/slides";

describe("slides", () => {
  it("exporta um array não vazio", () => {
    expect(slides.length).toBeGreaterThan(0);
  });

  it("cada slide possui as propriedades obrigatórias", () => {
    slides.forEach((slide) => {
      expect(slide.id).toBeTruthy();
      expect(slide.title).toBeTruthy();
      expect(slide.description).toBeTruthy();
      expect(slide.image).toBeTruthy();
      expect(slide.color).toBeTruthy();
    });
  });
});
