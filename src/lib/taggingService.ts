import { searchService } from "./searchService";

export interface TagSuggestion {
  tag: string;
  confidence: number; // 0-1
  reason: string; // Explanation for the suggestion
}

class TaggingService {
  private static instance: TaggingService;
  
  // Common categories and their related keywords
  private readonly categoryKeywords = {
    'Lernen': ['bildung', 'schule', 'studium', 'wissen', 'lehren', 'lernen', 'unterricht'],
    'Wissenschaft': ['forschung', 'experiment', 'theorie', 'hypothese', 'wissenschaft', 'labor', 'studie'],
    'Technik': ['computer', 'software', 'technologie', 'digital', 'internet', 'programm', 'app'],
    'Natur': ['tier', 'pflanze', 'umwelt', 'natur', 'ökologie', 'biologie', 'wald', 'meer'],
    'Gesundheit': ['gesund', 'medizin', 'körper', 'fitness', 'ernährung', 'krankheit', 'sport'],
    'Kultur': ['kunst', 'musik', 'literatur', 'geschichte', 'tradition', 'kultur', 'theater'],
    'Wirtschaft': ['business', 'geld', 'markt', 'unternehmen', 'wirtschaft', 'handel', 'finanzen'],
    'Sprache': ['sprache', 'wort', 'grammatik', 'übersetzen', 'sprechen', 'schreiben', 'text'],
    'Reise': ['land', 'stadt', 'reise', 'urlaub', 'kultur', 'sehenswürdigkeit', 'hotel'],
    'Essen': ['essen', 'kochen', 'rezept', 'küche', 'restaurant', 'lebensmittel', 'trinken']
  };

  // Subject-specific keywords
  private readonly subjectKeywords = {
    'Mathematik': ['zahl', 'rechnen', 'formel', 'geometrie', 'algebra', 'statistik', 'prozent'],
    'Physik': ['kraft', 'energie', 'bewegung', 'licht', 'wärme', 'elektrizität', 'atom'],
    'Chemie': ['element', 'reaktion', 'molekül', 'säure', 'base', 'labor', 'experiment'],
    'Biologie': ['zelle', 'organ', 'evolution', 'genetik', 'ökosystem', 'mensch', 'tier'],
    'Geschichte': ['zeit', 'ereignis', 'krieg', 'revolution', 'könig', 'antike', 'mittelalter'],
    'Geografie': ['kontinent', 'berg', 'fluss', 'klima', 'bevölkerung', 'hauptstadt', 'karte'],
    'Literatur': ['buch', 'autor', 'gedicht', 'roman', 'figur', 'text', 'interpretation'],
    'Philosophie': ['denken', 'ethik', 'moral', 'wahrheit', 'existenz', 'bewusstsein', 'logik']
  };

  static getInstance(): TaggingService {
    if (!TaggingService.instance) {
      TaggingService.instance = new TaggingService();
    }
    return TaggingService.instance;
  }

  /**
   * Generate automatic tag suggestions based on content
   */
  generateSuggestions(title: string, content: string = '', existingTags: string[] = []): TagSuggestion[] {
    const suggestions: TagSuggestion[] = [];
    const combinedText = `${title} ${content}`.toLowerCase();
    
    // Skip if text is too short
    if (combinedText.trim().length < 3) {
      return suggestions;
    }

    // Check category keywords
    for (const [category, keywords] of Object.entries(this.categoryKeywords)) {
      if (existingTags.includes(category)) continue;
      
      const matchCount = keywords.filter(keyword => 
        combinedText.includes(keyword.toLowerCase())
      ).length;
      
      if (matchCount > 0) {
        const confidence = Math.min(matchCount / keywords.length * 2, 1.0);
        suggestions.push({
          tag: category,
          confidence,
          reason: `Enthält ${matchCount} relevante Begriffe für ${category}`
        });
      }
    }

    // Check subject keywords
    for (const [subject, keywords] of Object.entries(this.subjectKeywords)) {
      if (existingTags.includes(subject)) continue;
      
      const matchCount = keywords.filter(keyword => 
        combinedText.includes(keyword.toLowerCase())
      ).length;
      
      if (matchCount > 0) {
        const confidence = Math.min(matchCount / keywords.length * 2, 1.0);
        suggestions.push({
          tag: subject,
          confidence,
          reason: `Passt zum Fachbereich ${subject}`
        });
      }
    }

    // Generate tags from frequent words
    const frequentWordTags = this.generateWordBasedTags(combinedText, existingTags);
    suggestions.push(...frequentWordTags);

    // Check for difficulty level indicators
    const difficultyTags = this.generateDifficultyTags(combinedText, existingTags);
    suggestions.push(...difficultyTags);

    // Check for format-specific tags
    const formatTags = this.generateFormatTags(title, content, existingTags);
    suggestions.push(...formatTags);

    // Sort by confidence and remove duplicates
    return suggestions
      .filter((suggestion, index, array) => 
        array.findIndex(s => s.tag === suggestion.tag) === index
      )
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, 10); // Limit to top 10 suggestions
  }

  /**
   * Generate tags based on frequent words
   */
  private generateWordBasedTags(text: string, existingTags: string[]): TagSuggestion[] {
    const suggestions: TagSuggestion[] = [];
    
    // Extract meaningful words (3+ characters, not common words)
    const commonWords = new Set([
      'der', 'die', 'das', 'und', 'oder', 'aber', 'mit', 'von', 'für', 'auf', 'an', 'in', 'zu', 'bei',
      'ist', 'sind', 'war', 'haben', 'sein', 'wird', 'kann', 'soll', 'auch', 'nur', 'noch', 'nicht',
      'ein', 'eine', 'einer', 'dem', 'den', 'des', 'sich', 'aus', 'als', 'wie', 'über', 'nach', 'vor'
    ]);

    const words = text
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => 
        word.length >= 3 && 
        !commonWords.has(word.toLowerCase()) &&
        !existingTags.some(tag => tag.toLowerCase() === word.toLowerCase())
      );

    // Count word frequency
    const wordCount = new Map<string, number>();
    words.forEach(word => {
      const lowerWord = word.toLowerCase();
      wordCount.set(lowerWord, (wordCount.get(lowerWord) || 0) + 1);
    });

    // Generate suggestions for frequent words
    for (const [word, count] of wordCount.entries()) {
      if (count >= 2 && word.length >= 4) {
        const confidence = Math.min(count / words.length * 10, 0.8);
        suggestions.push({
          tag: word.charAt(0).toUpperCase() + word.slice(1),
          confidence,
          reason: `Häufiger Begriff (${count}x erwähnt)`
        });
      }
    }

    return suggestions;
  }

  /**
   * Generate difficulty level tags
   */
  private generateDifficultyTags(text: string, existingTags: string[]): TagSuggestion[] {
    const suggestions: TagSuggestion[] = [];
    
    const beginnerIndicators = ['einfach', 'grundlagen', 'basis', 'einführung', 'anfänger', 'leicht'];
    const advancedIndicators = ['komplex', 'erweitert', 'fortgeschritten', 'schwierig', 'expert', 'profi'];
    
    const hasBeginnerTerms = beginnerIndicators.some(term => text.includes(term));
    const hasAdvancedTerms = advancedIndicators.some(term => text.includes(term));
    
    if (hasBeginnerTerms && !existingTags.includes('Anfänger')) {
      suggestions.push({
        tag: 'Anfänger',
        confidence: 0.7,
        reason: 'Enthält Begriffe für Einsteiger'
      });
    }
    
    if (hasAdvancedTerms && !existingTags.includes('Fortgeschritten')) {
      suggestions.push({
        tag: 'Fortgeschritten',
        confidence: 0.7,
        reason: 'Enthält komplexe Begriffe'
      });
    }

    return suggestions;
  }

  /**
   * Generate format-specific tags
   */
  private generateFormatTags(title: string, content: string, existingTags: string[]): TagSuggestion[] {
    const suggestions: TagSuggestion[] = [];
    
    // Check for specific formats or purposes
    if (title.toLowerCase().includes('vokabeln') && !existingTags.includes('Vokabeln')) {
      suggestions.push({
        tag: 'Vokabeln',
        confidence: 0.9,
        reason: 'Titel deutet auf Vokabelsammlung hin'
      });
    }
    
    if (title.toLowerCase().includes('prüfung') && !existingTags.includes('Prüfung')) {
      suggestions.push({
        tag: 'Prüfung',
        confidence: 0.8,
        reason: 'Bezieht sich auf Prüfungsvorbereitung'
      });
    }
    
    if ((title + content).toLowerCase().includes('definition') && !existingTags.includes('Definitionen')) {
      suggestions.push({
        tag: 'Definitionen',
        confidence: 0.8,
        reason: 'Enthält Begriffsdefinitionen'
      });
    }

    return suggestions;
  }

  /**
   * Get suggested tags for similar items
   */
  getSimilarItemTags(title: string, content: string = ''): string[] {
    const searchResults = searchService.search({
      query: title,
      type: ['abc-list', 'kawa', 'kaga']
    });

    const tagFrequency = new Map<string, number>();
    
    // Collect tags from similar items
    searchResults.slice(0, 5).forEach(result => {
      result.item.tags.forEach(tag => {
        tagFrequency.set(tag, (tagFrequency.get(tag) || 0) + 1);
      });
    });

    // Return tags used by multiple similar items
    return Array.from(tagFrequency.entries())
      .filter(([_, count]) => count >= 2)
      .map(([tag, _]) => tag)
      .slice(0, 5);
  }

  /**
   * Validate and clean tag
   */
  validateTag(tag: string): string | null {
    if (!tag || typeof tag !== 'string') return null;
    
    // Clean the tag
    const cleaned = tag
      .trim()
      .replace(/[^\w\s-]/g, '') // Remove special characters except hyphens
      .replace(/\s+/g, ' ') // Normalize whitespace
      .toLowerCase()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
    
    // Validate length
    if (cleaned.length < 2 || cleaned.length > 30) return null;
    
    return cleaned;
  }

  /**
   * Get tag usage statistics
   */
  getTagStatistics(): Map<string, number> {
    const allTags = searchService.getAllTags();
    const tagCount = new Map<string, number>();
    
    allTags.forEach(tag => {
      const results = searchService.search({ tags: [tag] });
      tagCount.set(tag, results.length);
    });

    return tagCount;
  }

  /**
   * Get most popular tags
   */
  getPopularTags(limit = 20): Array<{ tag: string; count: number }> {
    const tagStats = this.getTagStatistics();
    
    return Array.from(tagStats.entries())
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);
  }

  /**
   * Suggest tags for cleanup (unused, similar tags)
   */
  suggestTagCleanup(): {
    unused: string[];
    similar: Array<{ tags: string[]; suggestion: string }>;
  } {
    const tagStats = this.getTagStatistics();
    const unused = Array.from(tagStats.entries())
      .filter(([_, count]) => count === 0)
      .map(([tag, _]) => tag);

    const similar: Array<{ tags: string[]; suggestion: string }> = [];
    const allTags = Array.from(tagStats.keys());
    
    // Find similar tags
    for (let i = 0; i < allTags.length; i++) {
      for (let j = i + 1; j < allTags.length; j++) {
        const tag1 = allTags[i];
        const tag2 = allTags[j];
        
        if (this.areTagsSimilar(tag1, tag2)) {
          const existing = similar.find(s => s.tags.includes(tag1) || s.tags.includes(tag2));
          if (existing) {
            if (!existing.tags.includes(tag1)) existing.tags.push(tag1);
            if (!existing.tags.includes(tag2)) existing.tags.push(tag2);
          } else {
            similar.push({
              tags: [tag1, tag2],
              suggestion: tagStats.get(tag1)! > tagStats.get(tag2)! ? tag1 : tag2
            });
          }
        }
      }
    }

    return { unused, similar };
  }

  /**
   * Check if two tags are similar
   */
  private areTagsSimilar(tag1: string, tag2: string): boolean {
    const t1 = tag1.toLowerCase();
    const t2 = tag2.toLowerCase();
    
    // Check for plural/singular forms
    if ((t1 + 's' === t2) || (t2 + 's' === t1)) return true;
    if ((t1 + 'n' === t2) || (t2 + 'n' === t1)) return true;
    
    // Check for similar spelling (Levenshtein distance)
    return this.levenshteinDistance(t1, t2) <= 2 && Math.abs(t1.length - t2.length) <= 2;
  }

  /**
   * Calculate Levenshtein distance between two strings
   */
  private levenshteinDistance(str1: string, str2: string): number {
    const matrix = Array(str2.length + 1).fill(null).map(() => Array(str1.length + 1).fill(null));
    
    for (let i = 0; i <= str1.length; i++) matrix[0][i] = i;
    for (let j = 0; j <= str2.length; j++) matrix[j][0] = j;
    
    for (let j = 1; j <= str2.length; j++) {
      for (let i = 1; i <= str1.length; i++) {
        const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
        matrix[j][i] = Math.min(
          matrix[j][i - 1] + 1, // deletion
          matrix[j - 1][i] + 1, // insertion
          matrix[j - 1][i - 1] + indicator // substitution
        );
      }
    }
    
    return matrix[str2.length][str1.length];
  }
}

export const taggingService = TaggingService.getInstance();