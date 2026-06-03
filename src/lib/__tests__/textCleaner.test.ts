import { parseAnnouncementText } from '../textCleaner';

describe('textCleaner tests', () => {
  it('should handle null or undefined input gracefully', () => {
    const emptyResult = parseAnnouncementText(null);
    expect(emptyResult.blocks).toEqual([]);
    expect(emptyResult.boilerplate).toEqual([]);
    expect(emptyResult.metadata).toEqual([]);
    expect(emptyResult.highlights.metrics).toEqual([]);
  });

  it('should parse highlights correctly', () => {
    const rawText = `
      Granules India Q4FY26 Earnings Release.
      The company has bagged a project worth Rs. 500 Crore.
      For details, contact us at investor.relations@granulesindia.com or call 040-12345678.
      The meeting was held on June 03, 2026.
    `;
    const result = parseAnnouncementText(rawText);

    expect(result.highlights.contacts).toContain('investor.relations@granulesindia.com');
    expect(result.highlights.metrics).toContain('Rs. 500 Crore');
    expect(result.highlights.dates).toContain('June 03, 2026');
  });

  it('should separate cover letter and reflow text', () => {
    const rawText = `
      National Stock Exchange of India Limited
      Exchange Plaza, Bandra Kurla Complex
      Dear Sir,
      Sub: Press Release
      We are enclosing herewith a press release.
      Thanking you,
      Yours faithfully,
      For Granules India Limited
      Company Secretary
      
      GRANULES INDIA HIGHLIGHTS
      This is the main press release text
      which had an accidental newline here.
    `;
    const result = parseAnnouncementText(rawText);

    expect(result.metadata.some(line => line.includes('National Stock Exchange'))).toBe(true);
    expect(result.subject).toBe('Press Release');
    expect(result.coverLetter).toContain('Dear Sir,');
    expect(result.coverLetter).toContain('Thanking you,');
    expect(result.coverLetter).toContain('Company Secretary');

    // Content should have the main press release reflowed
    const paragraphBlock = result.blocks.find(b => b.type === 'paragraph');
    expect(paragraphBlock).toBeDefined();
    expect(paragraphBlock?.content).toContain('This is the main press release text which had an accidental newline here.');
  });

  it('should merge short-word vertical columns', () => {
    const rawText = `
      A
      copy
      of
      this
      document
      is
      attached.
    `;
    const result = parseAnnouncementText(rawText);
    const paragraphBlock = result.blocks.find(b => b.type === 'paragraph');
    expect(paragraphBlock).toBeDefined();
    expect(paragraphBlock?.content).toBe('A copy of this document is attached.');
  });
});
