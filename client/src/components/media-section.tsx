import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Film, Tv, Grid3X3, Star, Search, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import type { MediaItem } from "@shared/schema";

type FilterType = "all" | "movies" | "tv" | "new";

export default function MediaSection() {
  const [activeFilter, setActiveFilter] = useState<FilterType>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const { data: allMedia = [], isLoading } = useQuery<MediaItem[]>({
    queryKey: ['/api/media'],
  });

  const { data: searchResults = [] } = useQuery<MediaItem[]>({
    queryKey: ['/api/media/search', searchQuery],
    enabled: searchQuery.length > 0,
  });

  const filteredMedia = () => {
    let media = searchQuery.length > 0 ? searchResults : allMedia;
    
    switch (activeFilter) {
      case "movies":
        return media.filter(item => item.type === "movie");
      case "tv":
        return media.filter(item => item.type === "tv");
      case "new":
        return media.slice(0, 8); // Show newest additions
      default:
        return media;
    }
  };

  const movies = filteredMedia().filter(item => item.type === "movie").slice(0, 12);
  const tvShows = filteredMedia().filter(item => item.type === "tv").slice(0, 8);

  const handleSearch = () => {
    // Search is handled by the query when searchQuery changes
    console.log('Searching for:', searchQuery);
  };

  if (isLoading) {
    return (
      <section id="media" className="py-20 bg-secondary">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading media library...</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="media" className="py-20 bg-secondary" data-testid="media-section">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-bold mb-4">Media Library</h2>
          <p className="text-xl text-muted-foreground">Explore our extensive collection</p>
        </div>

        {/* Filter Buttons */}
        <div className="flex flex-wrap justify-center gap-4 mb-12">
          <Button
            className={`filter-button ${activeFilter === 'all' ? 'active' : ''}`}
            variant={activeFilter === 'all' ? 'default' : 'outline'}
            onClick={() => setActiveFilter('all')}
            data-testid="filter-all"
          >
            <Grid3X3 className="mr-2 h-4 w-4" />
            All Media
          </Button>
          <Button
            className={`filter-button ${activeFilter === 'movies' ? 'active' : ''}`}
            variant={activeFilter === 'movies' ? 'default' : 'outline'}
            onClick={() => setActiveFilter('movies')}
            data-testid="filter-movies"
          >
            <Film className="mr-2 h-4 w-4" />
            Movies
          </Button>
          <Button
            className={`filter-button ${activeFilter === 'tv' ? 'active' : ''}`}
            variant={activeFilter === 'tv' ? 'default' : 'outline'}
            onClick={() => setActiveFilter('tv')}
            data-testid="filter-tv"
          >
            <Tv className="mr-2 h-4 w-4" />
            TV Shows
          </Button>
          <Button
            className={`filter-button ${activeFilter === 'new' ? 'active' : ''}`}
            variant={activeFilter === 'new' ? 'default' : 'outline'}
            onClick={() => setActiveFilter('new')}
            data-testid="filter-new"
          >
            <Star className="mr-2 h-4 w-4" />
            New Additions
          </Button>
        </div>

        {/* Search Bar */}
        <div className="max-w-md mx-auto mb-12">
          <div className="flex gap-2">
            <Input
              type="text"
              placeholder="Search movies and TV shows..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-card border-border text-foreground"
              data-testid="search-input"
            />
            <Button 
              onClick={handleSearch}
              className="bg-primary hover:bg-primary/90"
              data-testid="search-button"
            >
              <Search className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Movies Section */}
        {(activeFilter === 'all' || activeFilter === 'movies') && movies.length > 0 && (
          <div className="mb-16">
            <h3 className="text-2xl font-bold mb-8 flex items-center">
              <Film className="text-primary mr-3" />
              Featured Movies
            </h3>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {movies.map((movie) => (
                <Card key={movie.id} className="media-card rounded-lg overflow-hidden" data-testid={`movie-${movie.id}`}>
                  <div className="aspect-[2/3] relative overflow-hidden">
                    <img 
                      src={movie.poster || '/api/placeholder/300/450'} 
                      alt={`${movie.title} poster`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <CardContent className="p-3">
                    <h6 className="font-bold text-sm truncate mb-1">{movie.title}</h6>
                    <p className="text-xs text-muted-foreground">{movie.year}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* TV Shows Section */}
        {(activeFilter === 'all' || activeFilter === 'tv') && tvShows.length > 0 && (
          <div className="mb-16">
            <h3 className="text-2xl font-bold mb-8 flex items-center">
              <Tv className="text-primary mr-3" />
              Popular TV Shows
            </h3>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {tvShows.map((show) => (
                <Card key={show.id} className="media-card rounded-lg overflow-hidden" data-testid={`tv-show-${show.id}`}>
                  <div className="aspect-[2/3] relative overflow-hidden">
                    <img 
                      src={show.poster || '/api/placeholder/300/450'} 
                      alt={`${show.title} cover`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <CardContent className="p-3">
                    <h6 className="font-bold text-sm truncate mb-1">{show.title}</h6>
                    <p className="text-xs text-muted-foreground">
                      {show.seasons} Season{show.seasons !== 1 ? 's' : ''}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Load More Button */}
        <div className="text-center">
          <Button 
            variant="outline" 
            size="lg"
            className="border-primary text-primary hover:bg-primary hover:text-primary-foreground"
            data-testid="load-more-button"
          >
            <Plus className="mr-2 h-4 w-4" />
            Load More Content
          </Button>
        </div>
      </div>
    </section>
  );
}
