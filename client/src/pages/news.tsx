
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ExternalLink, Clock, Newspaper, RefreshCw, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

interface NewsItem {
  title: string;
  link: string;
  pubDate: string;
  source: string;
  content: string;
}

export default function News() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [filter, setFilter] = useState<string>("All");
  
  const { data: news, isLoading, isFetching } = useQuery<NewsItem[]>({
    queryKey: ["/api/f1/news"],
    refetchOnWindowFocus: false,
  });

  const handleRefresh = async () => {
    await queryClient.invalidateQueries({ queryKey: ["/api/f1/news"] });
    toast({
      title: "Feed Updated",
      description: "Successfully fetched latest F1 news.",
    });
  };

  const filteredNews = news?.filter(item => 
    filter === "All" || item.source === filter
  );

  const sources = ["All", "Motorsport.com", "Autosport.com"];

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
        <div className="flex flex-col gap-2">
          <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent italic">
            CEBRIC NEWS
          </h1>
          <p className="text-muted-foreground flex items-center gap-2">
            <Newspaper className="w-4 h-4 text-primary" />
            Real-time updates from Motorsport, Autosport, and F1.com
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 p-1 bg-muted rounded-lg border">
            {sources.map(s => (
              <Button
                key={s}
                variant={filter === s ? "default" : "ghost"}
                size="sm"
                onClick={() => setFilter(s)}
                className="h-8 text-xs px-3"
              >
                {s}
              </Button>
            ))}
          </div>
          <Button 
            variant="outline" 
            size="icon" 
            onClick={handleRefresh}
            disabled={isFetching}
            className={isFetching ? "animate-spin" : ""}
          >
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="bg-card/50 backdrop-blur-sm border-border/50">
              <CardHeader className="gap-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-6 w-3/4" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-20 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredNews?.map((item, index) => (
            <Card key={index} className="group bg-card/50 backdrop-blur-sm border-border/50 hover:border-primary/50 transition-all hover-elevate overflow-hidden flex flex-col">
              <CardHeader>
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-[10px] font-bold tracking-widest uppercase px-2 py-0.5 rounded-full border ${
                    item.source === "Motorsport.com" 
                    ? "bg-primary/10 text-primary border-primary/20" 
                    : "bg-secondary/10 text-secondary border-secondary/20"
                  }`}>
                    {item.source}
                  </span>
                  <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                    <Clock className="w-3 h-3" />
                    {new Date(item.pubDate).toLocaleDateString()} {new Date(item.pubDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
                <a href={item.link} target="_blank" rel="noopener noreferrer">
                  <CardTitle className="text-lg leading-tight group-hover:text-primary transition-colors line-clamp-2 min-h-[3rem]">
                    {item.title}
                  </CardTitle>
                </a>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col">
                <p className="text-sm text-muted-foreground line-clamp-3 mb-4 italic flex-1">
                  {item.content}
                </p>
                <Button variant="ghost" size="sm" asChild className="w-full justify-between group/btn hover:bg-primary/10 hover:text-primary mt-auto">
                  <a href={item.link} target="_blank" rel="noopener noreferrer">
                    Read Article
                    <ExternalLink className="w-3 h-3 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" />
                  </a>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
