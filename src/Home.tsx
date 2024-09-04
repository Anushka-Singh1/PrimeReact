import axios from "axios";
import React, { useEffect, useState } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Paginator } from "primereact/paginator";
import { Checkbox } from "primereact/checkbox";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { ProgressSpinner } from "primereact/progressspinner";
import "./App.css";

interface Artwork {
  id: number;
  title: string;
  place_of_origin: string;
  artist_display: string;
  inscriptions: string | null;
  date_start: number | null;
  date_end: number | null;
}

const Home: React.FC = () => {
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [totalRecords, setTotalRecords] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [selectedArtworks, setSelectedArtworks] = useState<Set<number>>(
    new Set()
  );
  const [overlayVisible, setOverlayVisible] = useState<boolean>(false);
  const [rowsToSelect, setRowsToSelect] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const rowsPerPage = 12;
  const [pageRowSelection, setPageRowSelection] = useState<Map<number, number>>(
    new Map()
  );

  useEffect(() => {
    if (currentPage != 0) fetchArtworks(currentPage);
  }, [currentPage]);

  useEffect(() => {
    const fetchAndSetLoading = async () => {
      if (currentPage === 0 && loading) {
        await fetchArtworks(currentPage);
        setLoading(false);
      }
    };

    fetchAndSetLoading();
  }, [currentPage, loading]);

  const fetchArtworks = async (p: number) => {
    if (p == 0) p = 1;
    else p = currentPage;
    setLoading(true);
    try {
      const response = await axios.get(
        `https://api.artic.edu/api/v1/artworks?page=${p}&limit=${rowsPerPage}`
      );
      const data: Artwork[] = response.data.data.map((item: any) => ({
        id: item.id,
        title: item.title,
        place_of_origin: item.place_of_origin,
        artist_display: item.artist_display,
        inscriptions: item.inscriptions,
        date_start: item.date_start,
        date_end: item.date_end,
      }));

      applyPageSelection(p, data);
      setArtworks(data);
      setTotalRecords(response.data.pagination.total);
    } catch (error) {
      console.error("Error fetching artworks:", error);
    } finally {
      setLoading(false);
    }
  };

  const onPageChange = (event: { page: number }) => {
    const nextPage = event.page + 1;
    setCurrentPage(nextPage);
  };

  const applyPageSelection = (page: number, currentArtworks: Artwork[]) => {
    const rowsToSelectOnPage = pageRowSelection.get(page) || 0;
    const newSelectedArtworks = new Set(selectedArtworks);
    currentArtworks.forEach((artwork, index) => {
      if (index < rowsToSelectOnPage) {
        newSelectedArtworks.add(artwork.id);
      }
    });
    setSelectedArtworks(newSelectedArtworks);
    pageRowSelection.delete(page);
  };

  const onCheckboxChange = (id: number) => {
    setSelectedArtworks((prevSelected) => {
      const updatedSelected = new Set(prevSelected);
      if (updatedSelected.has(id)) {
        updatedSelected.delete(id);
      } else {
        updatedSelected.add(id);
      }
      return updatedSelected;
    });
  };

  const checkboxBodyTemplate = (rowData: Artwork) => {
    const isSelected = selectedArtworks.has(rowData.id);
    return (
      <Checkbox
        checked={isSelected}
        onChange={() => onCheckboxChange(rowData.id)}
      />
    );
  };

  const handleRowsToSelectChange = async () => {
    setOverlayVisible(false);
    setLoading(true);
    const newPageRowSelection = new Map<number, number>();
    selectedArtworks.clear();
    let remainingRowsToSelect = rowsToSelect;
    let page = 1;

    while (remainingRowsToSelect > 0) {
      const rowsOnThisPage = Math.min(remainingRowsToSelect, rowsPerPage);
      newPageRowSelection.set(page, rowsOnThisPage);
      remainingRowsToSelect -= rowsOnThisPage;
      page++;
    }

    setPageRowSelection(newPageRowSelection);
    setCurrentPage(0);
  };

  return (
    <div>
      {loading ? (
        <div
          style={{ marginTop: "15%", marginLeft: "40%" }}
          className="loader-container"
        >
          <ProgressSpinner />
          <p>Loading</p>
        </div>
      ) : (
        <>
          <Button
            style={{ marginBottom: "0.5%", gap: "5px" }}
            onClick={() => setOverlayVisible(true)}
            label="Select Records"
          />
          <DataTable value={artworks} tableStyle={{ minWidth: "100%" }}>
            <Column
              style={{ width: "5%" }}
              body={checkboxBodyTemplate}
              header=" "
            />
            <Column
              style={{ width: "16%", paddingLeft: "1%" }}
              field="title"
              header="Title"
            ></Column>
            <Column
              style={{ width: "9%", paddingLeft: "0.5%" }}
              field="place_of_origin"
              header="Place of Origin"
            ></Column>
            <Column
              style={{ width: "30%", paddingLeft: "1%" }}
              field="artist_display"
              header="Artist"
            ></Column>
            <Column
              style={{ width: "30%", paddingLeft: "1%" }}
              field="inscriptions"
              header="Inscriptions"
            ></Column>
            <Column
              style={{ width: "5%" }}
              field="date_start"
              header="Start Date"
            ></Column>
            <Column
              style={{ width: "5%" }}
              field="date_end"
              header="End Date"
            ></Column>
          </DataTable>
          <Paginator
            first={currentPage != 0 ? (currentPage - 1) * rowsPerPage : 0}
            rows={rowsPerPage}
            totalRecords={totalRecords}
            onPageChange={onPageChange}
            className="paginator"
          />
          <Dialog
            header="Select Number of Records"
            visible={overlayVisible}
            onHide={() => setOverlayVisible(false)}
          >
            <div className="p-mb-3">
              <InputText
                type="number"
                value={rowsToSelect.toString()}
                onChange={(e) => setRowsToSelect(Number(e.target.value))}
                placeholder="Number of records"
              />
            </div>
            <Button label="Apply" onClick={handleRowsToSelectChange} />
          </Dialog>
        </>
      )}
    </div>
  );
};

export default Home;
