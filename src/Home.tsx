import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Paginator } from 'primereact/paginator';
import { Checkbox } from 'primereact/checkbox';
import './App.css';

interface Artwork {
  id: number;
  title: string;
  place_of_origin: string;
  artist_display: string;
  inscription: string | null;
  date_start: number | null;
  date_end: number | null;
}

const Home: React.FC = () => {
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [totalRecords, setTotalRecords] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [selectedArtworks, setSelectedArtworks] = useState<Set<number>>(new Set());
  const rowsPerPage = 12;

  useEffect(() => {
    const fetchArtworks = async (page: number) => {
      try {
        const response = await axios.get(`https://api.artic.edu/api/v1/artworks?page=${page}&limit=${rowsPerPage}`);
        const data = response.data.data.map((item: any) => ({
          id: item.id,
          title: item.title,
          place_of_origin: item.place_of_origin,
          artist_display: item.artist_display,
          inscriptions: item.inscriptions,
          date_start: item.date_start,
          date_end: item.date_end,
        }));
        setArtworks(data);
        setTotalRecords(response.data.pagination.total);
      } catch (error) {
        console.error('Error fetching artworks:', error);
      }
    };

    fetchArtworks(currentPage);
  }, [currentPage]);

  const onPageChange = (event: any) => {
    setCurrentPage(event.page + 1);
  };

  const onCheckboxChange = (id: number) => {
    setSelectedArtworks(prev => {
      const updated = new Set(prev);
      if (updated.has(id)) {
        updated.delete(id);
      } else {
        updated.add(id);
      }
      return updated;
    });
  };

  const checkboxBodyTemplate = (rowData: Artwork) => {
    return (
      <Checkbox
        checked={selectedArtworks.has(rowData.id)}
        onChange={() => onCheckboxChange(rowData.id)}
      />
    );
  };

  return (
    <div>
      <DataTable value={artworks} tableStyle={{ minWidth: '50rem' }}>
        <Column body={checkboxBodyTemplate} header="Select" style={{ width: '3rem' }} />
        <Column field="title" header="Title"></Column>
        <Column field="place_of_origin" header="Place of Origin"></Column>
        <Column field="artist_display" header="Artist"></Column>
        <Column field="inscriptions" header="Inscriptions"></Column>
        <Column field="date_start" header="Start Date"></Column>
        <Column field="date_end" header="End Date"></Column>
      </DataTable>
      <Paginator
        first={(currentPage - 1) * rowsPerPage}
        rows={rowsPerPage}
        totalRecords={totalRecords}
        onPageChange={onPageChange}
        rowsPerPageOptions={[12]}
        className="paginator"
      />
    </div>
  );
};

export default Home;
